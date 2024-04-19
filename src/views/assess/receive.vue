<template>
  <div class="app-container">
    <!-- 头部搜索 -->
    <div style="position: relative;">
      <el-tabs v-model="listQuery.type" @tab-click="typeChange">
        <el-tab-pane v-for="item in typeOptions" :key="item.id" :label="item.name" :name="item.id"></el-tab-pane>
      </el-tabs>
      <span class="receiveddir" v-if="receiveddir != 0">{{ receiveddir }}</span>
    </div>
    <div class="search-bgc search-mr">
      <!-- <span class="m-left" v-if="this.user.orgType != 5 && user.orgType != 4">项目</span>
      <el-select v-model="listQuery.projectId" @change="projectIdChange" size="mini" class="wh-150" v-if="this.user.orgType != 5 && user.orgType != 4">
        <el-option v-for="(item, idx) in projectList" :key="idx" :value="item.pkId" :label="item.projectName"></el-option>
      </el-select> -->
      <span class="m-left">{{ listQuery.type == 0 ? "接收单位" : "发送单位" }}</span>
      <el-select v-model="listQuery.customId" size="mini" class="wh-150">
        <el-option v-for="(item, idx) in companyList" :key="idx" :value="item.pkId" :label="item.customName"></el-option>
      </el-select>
      <span class="m-left">状态</span>
      <el-select v-model="listQuery.enableStatus" size="mini" class="wh-150">
        <el-option value="" label="全部"></el-option>
        <el-option value="0" label="草稿" v-if="listQuery.type != '1'"></el-option>
        <el-option value="1" label="待接收"></el-option>
        <el-option value="2" label="部分接收"></el-option>
        <el-option value="3" label="已撤回"></el-option>
        <el-option value="4" label="已接收"></el-option>
      </el-select>
      <span class="m-left">发送日期</span>
      <el-date-picker v-model="listQuery.beginTime" value-format="yyyy-MM-dd" class="wh-150" :picker-options="pickerOptionsAnd" size="mini" type="date" placeholder="选择日期时间"> </el-date-picker>
      <span>起</span>
      <el-date-picker v-model="listQuery.endTime" value-format="yyyy-MM-dd" class="wh-150" :picker-options="pickerOptionsEnd" size="mini" type="date" placeholder="选择日期时间"> </el-date-picker>
      <span>止</span>
      <span class="m-left">关键字</span>
      <el-input v-model="listQuery.keyWord" placeholder="请输入日志内容" size="mini" class="wh-150" maxlength="50"></el-input>
      <el-button type="primary" icon="el-icon-search" size="mini" class="ml-20" @click="search">查询</el-button>
      <el-button v-if="listQuery.type == 0" v-has="'assess:receive:add'" size="mini" class="add" type="primary" @click="add">新增</el-button>
      <el-button v-if="listQuery.type == 1" size="mini" @click="receiver" class="add" type="primary">设置收文负责人</el-button>
    </div>
    <div class="tab-container">
      <div class="table-data" style="height:  78%;margin-top: 10px;">
        <el-table ref="tables" :data="tableData" stripe height="95%" style="width: 100%" v-loading="loading" :tooltip-effect="'light'" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="meetingTitle" label="发送主题" min-width="120">
            <template slot-scope="{ row }">
              <div v-if="listQuery.type == 0" class="ellipsistwo" :title="row.articleTitle" style="color:#02a7f0;cursor: pointer;" @click="openInfoDialog(row, 1)">
                <i class="el-icon-position"></i>
                {{ row.articleTitle }}
              </div>
              <div class="ellipsistwo" v-if="listQuery.type == 1" :title="row.articleTitle"><i class="el-icon-message"></i>{{ row.articleTitle }}</div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="receiveOrgName" v-if="listQuery.type == 0" label="接收单位" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="orgName" v-if="listQuery.type == 1" label="发送单位" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="sendingTime" label="发送时间" min-width="160" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="userName" label="发送人" min-width="100" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="receiveTime" label="接收时间" v-if="listQuery.type == 1" min-width="100" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="receiveName" label="接收人" v-if="listQuery.type == 1" min-width="100" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="enableStatusName" label="状态" min-width="90" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="operateSource" label="操作" min-width="180">
            <template slot-scope="{ row }">
              <el-button plain type="primary" size="mini" v-has="'assess:receive:query'" v-if="listQuery.type == '0' || (row.enableStatus != 1 && listQuery.type == '1')" @click="openInfoDialog(row, listQuery.type)">查看</el-button>
              <el-button plain v-show="row.editStatus" v-has="'assess:receive:update'" type="warning" size="mini" @click="compile(row.pkId)">编辑</el-button>
              <el-button plain v-show="row.deleteStatus" v-has="'assess:receive:delete'" type="danger" size="mini" @click="expurgate(row.pkId)">删除</el-button>
              <el-button plain v-show="row.cancelStatus" type="danger" v-has="'assess:receive:withdraw'" size="mini" @click="cancel(row.pkId)">撤回</el-button>
              <el-button plain v-show="row.isAppear == 1" size="mini" @click="reception(row.pkId)">接收</el-button>
              <el-button plain v-show="listQuery.type == 1 && row.enableStatus == 4" v-has="'assess:receive:forward'" size="mini" @click="transmit(row)">转发</el-button>
              <el-button plain v-show="listQuery.type == 0 && row.enableStatus == 3" type="warning" size="mini" @click="copyNew(row.pkId)">复制新建</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <table-paging :current-page="listQuery.pageNum" :page-size="listQuery.pageSize" :total="totalCount" @handleSizeChange="pageSizeChange" @handleCurrentChange="pageCurrentChange"></table-paging>
    </div>
    <!-- 文章信息 -->
    <el-dialog :title="informationTitle" width="60%" top="2vw" :visible="infoDialog" @close="closeInfoDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="infoDialog">
        <div class="infoDialog-head">
          <h2>{{ dialogForm.articleTitle }}</h2>
          <div class="sendInfo">
            <span class="mr-20">发布人:{{ dialogForm.userName }}</span>
            <span>发布时间:{{ dialogForm.sendingTime }}</span>
          </div>
        </div>
        <el-divider></el-divider>
        <div style="margin-top: 10px;">会议简介</div>
        <myEditorJustLook :pro-html="dialogForm.articleContent"></myEditorJustLook>
        <!-- <div v-html="dialogForm.meetingContent" class="overDiv"></div> -->
        <el-col :span="24" style="display: flex;margin-top: 10px;">
          <div class="labels">附件</div>
          <div class="content">
            <div class="upLoad-show">
              <p v-for="(item, idx) in fileList" :key="idx">
                <span style="margin: 10px 0 0 10px; color: #9dbef3;cursor: pointer;" @click="imgPreview(item)">{{ item.name }}</span>
                <!-- <el-button size="mini" @click="imgPreview(item)">现场图片</el-button> -->
              </p>
            </div>
          </div>
        </el-col>
      </div>
    </el-dialog>
    <!-- 发文新增编辑 -->
    <el-dialog :title="dialogTitle" :visible="dialogVisible" width="60%" @close="closeDialog(false)" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog">
        <el-row :span="24" class="el-row-data dialog-form">
          <el-col :span="12" class="dialog-form-item mb-10">
            <div class="labels">发文主题</div>
            <div class="content">
              <el-input v-model="dialogForm.articleTitle" :disabled="dialogType == 1" size="mini" maxlength="100"></el-input>
            </div>
          </el-col>
          <el-col :span="1" class="dialog-form-item mb-10">
            <el-button type="primary" @click="quote" size="mini" v-if="dialogType != 1">引用</el-button>
          </el-col>
          <el-col :span="5" class="dialog-form-item mb-10">
            <div class="labels">发送类型</div>
            <div class="content">
              <el-select v-model="dialogForm.sendingType" size="mini" :disabled="dialogType == 1" class="wh-150" @change="sendingTypeChange">
                <el-option :value="0" label="外部发文"></el-option>
                <el-option :value="1" label="内部发文"></el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="6" class="dialog-form-item mb-10">
            <div class="labels">发送人</div>
            <div class="content">
              <el-input v-model="dialogForm.userName" disabled size="mini"></el-input>
            </div>
          </el-col>
          <el-col :span="24" class="dialog-form-item mb-10">
            <div class="alabels">
              <div>{{ dialogForm.sendingType === 0 ? "发送单位" : "发送人员" }}</div>
              <div><el-button v-if="dialogType != 1" type="primary" @click="dialogForm.sendingType === 0 ? sendingUnit(0) : choice()" size="mini">选择</el-button></div>
            </div>
            <div class="content">
              <div style="ackground: #f2f2f2;">
                <div v-show="checkList.length" class="check-list" v-for="(item, idx) in checkList" :key="idx">
                  <span>{{ item.name }}</span>
                  <span v-if="dialogType != 1" class="close-remove" @click="remove(idx)">x</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="24" class="dialog-form-item mb-10">
            <div class="alabels">文章内容</div>
            <div class="content">
              <myEditor :pro-html="dialogForm.articleContent" ref="myEditor" v-if="dialogType != 1 && dialogVisible"></myEditor>
              <myEditorJustLook :pro-html="dialogForm.articleContent" v-else></myEditorJustLook>
            </div>
          </el-col>
          <el-col :span="24" style="align-items:baseline;" class="dialog-form-item mb-10">
            <div class="labels">附件</div>
            <div class="content">
              <div class="upLoad-show">
                <p v-for="(item, idx) in fileList" :key="idx">
                  <span style="color: #9dbef3;cursor: pointer;" @click="imgPreview(item)">{{ item.name }}</span>
                  <!-- <el-button size="mini" >现场图片</el-button> -->
                  <span v-if="dialogType != 1">
                    <el-button size="mini" style="color: red;border: none;" icon="el-icon-close" @click="fileRemove(item, idx)"></el-button>
                  </span>
                </p>
              </div>
              <el-button v-if="dialogType != 1" size="mini" @click="uploading">选择文件</el-button>
            </div>
          </el-col>
        </el-row>
      </div>
      <div></div>
      <div slot="footer" v-if="dialogType != 1">
        <el-button type="primary" size="mini" @click="preserve(0)">保存草稿</el-button>
        <el-button type="primary" size="mini" @click="preserve(1)">发送</el-button>
        <el-button size="mini" @click="closeDialog(false)">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 引用文章 -->
    <el-dialog title="引用文章" :visible="quotelVisible" width="50%" @close="quotelDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog">
        <el-row :span="24" class="el-row-data dialog-form">
          <el-col :span="6" class="dialog-form-item mb-10">
            <div class="labels">引用类型</div>
            <div class="content">
              <el-select v-model="quotelDate.type" @change="quotelTypeChange" placeholder="请选择" size="mini">
                <el-option value="0" label="公司新闻"></el-option>
                <el-option value="1" label="公司公告"></el-option>
                <el-option value="2" label="会议通知"></el-option>
              </el-select>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="tab-container">
        <el-table ref="tables" :data="quotelList" stripe style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }" :tooltip-effect="'light'">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (quotelDate.pageNum - 1) * quotelDate.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="operateSource" label="操作" min-width="70">
            <template slot-scope="{ row }">
              <el-button type="primary" size="mini" @click="referenceSelection(row)">选择</el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="articleTitle" label="文章标题" min-width="120">
            <template slot-scope="{ row }">
              <div :title="row.articleTitle">{{ row.articleTitle }}</div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="userName" label="发布人" min-width="80" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" prop="sendingTime" label="发布时间" min-width="100" show-overflow-tooltip></el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <table-paging :current-page="quotelDate.pageNum" :page-size="quotelDate.pageSize" :total="quotelTotal" @handleSizeChange="quotelSizeChange" @handleCurrentChange="quotelCurrentChange"></table-paging>
      </div>
    </el-dialog>
    <!-- 选择单位 -->
    <el-dialog title="选择单位" :visible="unitVisible" width="50%" @close="unitDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog">
        <el-row :span="24" class="el-row-data dialog-form">
          <el-col :span="8" class="dialog-form-item mb-10">
            <div class="labels">合作单位</div>
            <div class="content">
              <el-select v-model="unitDate.type" placeholder="请选择" @change="unitDateChange" size="mini">
                <el-option size="mini" v-for="(item, index) in cooperator" :key="index" :label="item.name" :value="item.id"> </el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="6" class="dialog-form-item mb-10">
            <el-input v-model="unitDate.orgName" @input="orgNameInput" size="mini" placeholder="单位名称" maxlength="100"></el-input>
          </el-col>
        </el-row>
      </div>
      <div class="tab-container" style="margin: 10px;">
        <el-table ref="multipleTable" :data="unitList" stripe style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }" @selection-change="unitSelectionChange">
          <el-table-column type="selection" align="center" width="50"> </el-table-column>
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (unitDate.pageNum - 1) * unitDate.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="customName" label="单位名称" min-width="80"></el-table-column>
          <el-table-column align="center" prop="linkMan" label="联系人" min-width="160"></el-table-column>
          <el-table-column align="center" prop="linkPhone" label="联系电话" min-width="100"></el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <table-paging :current-page="unitDate.pageNum" :page-size="unitDate.pageSize" :total="unitTotal" @handleSizeChange="unitSizeChange" @handleCurrentChange="unitCurrentChange"></table-paging>
      </div>
      <div slot="footer">
        <el-button type="primary" @click="unitEnsure">确 定</el-button>
        <el-button @click="unitDialog">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 转发文章 -->
    <el-dialog title="转发文章" :visible="transmitVisible" width="60%" @close="transmiDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog">
        <el-row :span="24" class="el-row-data dialog-form">
          <el-col :span="10" class="dialog-form-item mb-10">
            <div class="labels">文章标题</div>
            <div class="content">
              <el-input v-model="transmitForm.articleTitle" :disabled="dialogType === 1" size="mini" maxlength="100"></el-input>
            </div>
          </el-col>
          <el-col :span="2" class="dialog-form-item mb-10"> </el-col>
          <el-col :span="6" class="dialog-form-item mb-10">
            <div class="labels">转发类型</div>
            <div class="content">
              <el-select v-model="transmitForm.type" size="mini" @change="transmitFormChange" class="wh-150">
                <el-option value="0" label="指定人员"></el-option>
                <el-option value="4" label="指定单位"></el-option>
                <el-option value="1" label="公司新闻"></el-option>
                <el-option value="2" label="公司公告"></el-option>
                <el-option value="3" label="会议通知"></el-option>
              </el-select>
            </div>
          </el-col>
          <el-col :span="6" class="dialog-form-item mb-10">
            <div class="labels">发布人</div>
            <div class="content">
              <el-input v-model="dialogForm.userName" disabled size="mini"></el-input>
            </div>
          </el-col>
          <el-col :span="24" class="dialog-form-item mb-10" v-if="transmitForm.type == 0">
            <div class="alabels">
              <div>转发人员</div>
              <div><el-button type="primary" @click="choice" size="mini">选择</el-button></div>
            </div>
            <div class="content">
              <div style="ackground: #f2f2f2;">
                <div v-show="checkList.length" class="check-list" v-for="(item, idx) in checkList" :key="idx">
                  <span>{{ item.name }}</span>
                  <span class="close-remove" @click="remove(idx)">x</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="24" class="dialog-form-item mb-10" v-if="transmitForm.type == 4">
            <div class="alabels">
              <div>转发单位</div>
              <div><el-button type="primary" @click="sendingUnit(1)" size="mini">选择</el-button></div>
            </div>
            <div class="content">
              <div style="ackground: #f2f2f2;">
                <div v-show="checkList.length" class="check-list" v-for="(item, idx) in checkList" :key="idx">
                  <span>{{ item.name }}</span>
                  <span class="close-remove" @click="remove(idx)">x</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12" class="dialog-form-item mb-10" v-if="transmitForm.type == 1 || transmitForm.type == 2">
            <div class="labels">文章摘要</div>
            <div class="content">
              <el-input v-model="transmitForm.noticeAbstract" type="textarea" size="mini" :rows="4" :resize="'none'" maxlength="500"></el-input>
            </div>
          </el-col>
          <el-col :span="12" v-if="transmitForm.type == 1 || transmitForm.type == 2">
            <div class="dialog-form-item mb-10" v-if="transmitForm.type == 1 || transmitForm.type == 2">
              <div class="labels w-110">APP轮播</div>
              <div class="content">
                <el-checkbox v-model="checked" :disabled="dialogType === 1">启用</el-checkbox>
                <!-- <el-checkbox-group v-model="transmitForm.publishing">
                <el-checkbox :label="0">PC端 <i class="el-icon-s-platform iconsColor"></i></el-checkbox>
                <el-checkbox :label="1">APP端 <i class="el-icon-mobile-phone iconsColor"></i></el-checkbox>
              </el-checkbox-group> -->
              </div>
            </div>
            <div class="dialog-form-item mb-10" v-if="transmitForm.type == 1 || transmitForm.type == 2">
              <div class="labels w-110">缩 略 图</div>
              <div class="content imgList">
                <div class="imgs" v-if="transmitForm.rotationUrl">
                  <img :src="transmitForm.rotationUrl" alt="" />
                  <div class="mask">
                    <span class="el-icon-zoom-in maskIcon" @click="perImg(transmitForm.rotationUrl)"></span>
                    <span class="maskIcon el-icon-delete" @click="delImg" v-if="dialogType !== 1"></span>
                  </div>
                </div>
                <div class="uploadDiv" @click="clickUpload" v-if="!transmitForm.rotationUrl && dialogType !== 1">
                  <span class="el-icon-plus uploadIcon"></span>
                </div>
                <div v-if="!transmitForm.rotationUrl && dialogType === 1">暂无轮播图</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6" class="dialog-form-item mb-10" v-if="transmitForm.type == 3">
            <div class="labels">会议场所</div>
            <div class="content">
              <el-input v-model="transmitForm.meetingPlace" size="mini" maxlength="100"></el-input>
            </div>
          </el-col>
          <el-col :span="6" class="dialog-form-item mb-10" v-if="transmitForm.type == 3">
            <div class="labels">主讲人</div>
            <div class="content">
              <el-input v-model="transmitForm.speaker" size="mini" maxlength="100"></el-input>
            </div>
          </el-col>
          <el-col :span="6" class="dialog-form-item mb-10" v-if="transmitForm.type == 3">
            <div class="labels">会议时间</div>
            <div class="content">
              <el-date-picker v-model="transmitForm.meetingStartTime" class="wh-200" value-format="yyyy-MM-dd HH:mm:ss" size="mini" type="datetime" placeholder="选择日期时间"> </el-date-picker>
            </div>
          </el-col>
          <el-col :span="6" class="dialog-form-item mb-10" v-if="transmitForm.type == 3">
            <div class="labels">至</div>
            <div class="content">
              <el-date-picker v-model="transmitForm.meetingEndTime" class="wh-200" value-format="yyyy-MM-dd HH:mm:ss" size="mini" type="datetime" placeholder="选择日期时间"> </el-date-picker>
            </div>
          </el-col>
          <el-col :span="24" class="dialog-form-item mb-10" v-if="transmitForm.type == 3">
            <div class="alabels">
              <div>参加人员</div>
              <div><el-button type="primary" @click="choice" size="mini">选择</el-button></div>
            </div>
            <div class="content">
              <div style="ackground: #f2f2f2;">
                <div v-show="checkList.length" class="check-list" v-for="(item, idx) in checkList" :key="idx">
                  <span>{{ item.name }}</span>
                  <span class="close-remove" @click="remove(idx)">x</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="24" class="dialog-form-item mb-10">
            <div class="alabels">文章内容</div>
            <div class="content">
              <myEditor :pro-html="dialogForm.articleContent" ref="myEditor" v-if="dialogType !== 1 && transmitVisible"></myEditor>
              <!-- <div class="editor" v-html="dialogForm.articleContent" v-else></div> -->
              <myEditorJustLook :pro-html="dialogForm.articleContent" v-else></myEditorJustLook>
            </div>
          </el-col>
          <el-col :span="24" class="dialog-form-item mb-10">
            <div class="labels">附件</div>
            <div class="content">
              <div class="upLoad-show">
                <p v-for="(item, idx) in fileList" :key="idx">
                  <span>{{ item.name }}</span>
                  <span v-if="dialogType != 1">
                    <el-button size="mini" style="color: red;border: none;" icon="el-icon-close" @click="fileRemove(item, idx)"></el-button>
                  </span>
                </p>
              </div>
              <el-button v-if="dialogType != 1" size="mini" @click="uploading">选择文件</el-button>
            </div>
          </el-col>
        </el-row>
      </div>
      <div></div>
      <div slot="footer">
        <el-button type="primary" size="mini" @click="transmitPreserve(0)" v-if="!['0', '4'].includes(transmitForm.type)">保存草稿</el-button>
        <el-button type="primary" size="mini" @click="transmitPreserve(1)">发布</el-button>
        <el-button size="mini" @click="transmiDialog">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 选择人员 -->
    <el-dialog title="选择人员" :visible="personnelVisible" width="50%" @close="personnelDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog">
        <el-row :span="24" class="el-row-data dialog-form">
          <el-col :span="6" class="dialog-form-item mb-10">
            <div class="labels">选择部门</div>
            <div class="content">
              <!-- <el-input v-model="dialogForm.meetingTitle" :disabled="dialogType === 1" size="mini" maxlength="100"></el-input> -->
              <el-select v-model="department" placeholder="请选择" size="mini" @change="selDeptChange">
                <el-option v-for="item in departmentList" :key="item.pkId" :label="item.deptName" :value="item.pkId"> </el-option>
              </el-select>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="tab-container" style="margin: 10px;">
        <el-table ref="tables" :data="orgList" stripe style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }" @selection-change="handleSelectionChange">
          <el-table-column type="selection" align="center" width="35"> </el-table-column>
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (orgPage.pageNum - 1) * orgPage.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="userName" label="姓名" min-width="80"></el-table-column>
          <el-table-column align="center" prop="telephone" label="联系电话" min-width="160"></el-table-column>
          <el-table-column align="center" prop="deptName" label="所属部门" min-width="100"></el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
        <table-paging :current-page="orgPage.pageNum" :page-size="orgPage.pageSize" :total="total" @handleSizeChange="orgSizeChange" @handleCurrentChange="orgCurrentChange"></table-paging>
      </div>
      <div slot="footer">
        <el-button type="primary" @click="ensure">确 定</el-button>
        <el-button @click="personnelDialog">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 设置收文负责人 -->
    <el-dialog title="设置收文负责人" :visible="receiverShow" width="500px" @close="receiverClose" v-dialogDrag :close-on-click-modal="false" v-loading="loading" :close-on-press-escape="false">
      <div class="dialog" style="margin-top: 10px;">
        <div style="width: 300px;margin: 0 auto;">
          <span>负责人: </span>
          <el-select v-model="receiverTo" placeholder="请选择" size="mini">
            <el-option v-for="item in receiverList" :key="item.pkId" :label="item.userName + '' + (item.isMaster ? '【管理员】' : `【${item.deptName}】`)" :value="item.pkId">
              <span>{{ item.userName }}</span>
              <span style="color:#aaaaaa;font-size:12px">{{ item.isMaster ? "【管理员】" : `【${item.deptName}】` }}</span>
            </el-option>
          </el-select>
        </div>
      </div>
      <div style="margin: 0 auto; margin-top: 10px; width: 300px;border: 1px dashed #bbbbbb; padding: 10px;">
        <div>提示:</div>
        <div style="color:  #bbbbbb;">
          此处负责人,可进行接收其他单位发文，一级转发收文信息等，默认管理员为负责人。
        </div>
      </div>
      <div style="height: 10px;"></div>
      <div slot="footer">
        <el-button size="mini" @click="receiverClose">取 消</el-button>
        <el-button size="mini" type="primary" @click="receiverEnsure">保 存</el-button>
      </div>
    </el-dialog>
    <!-- 预览图片弹框 -->
    <el-dialog :visible.sync="ImgDialog">
      <div class="prevDialog">
        <img width="100%" :src="dialogImageUrl" alt="" />
      </div>
    </el-dialog>
    <input v-show="false" type="file" accept="image/*" ref="files" id="upload" @change="upLoad" />
    <!-- 上传用input框 -->
    <input v-show="false" type="file" ref="imgFiles" id="uploadImg" accept=".jpeg,.jpg,.png" @change="uploadImg" />
  </div>
</template>

<script>
import myEditor from "@/components/myEditor/myEditor.vue";
import myEditorJustLook from "@/components/myEditor/myEditorJustLook.vue";
import { getStringImgSrc } from "../../utils/commond";
import QRCode from "qrcodejs2";
import COS from "cos-js-sdk-v5";
export default {
  name: "notice",
  components: { myEditor, myEditorJustLook },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  data() {
    return {
      projectList: [],
      typeOptions: [
        { name: "发文", id: "0" },
        { name: "收文", id: "1" }
      ],
      cooperator: [],
      loading: false,
      totalCount: 0,
      listQuery: {
        pageNum: 1,
        pageSize: 10,
        enableStatus: "",
        keyWord: "",
        projectId: "",
        customId: "",
        beginTime: "",
        endTime: "",
        type: "0"
      },
      quotelVisible: false,
      quotelDate: {
        pageNum: 1,
        pageSize: 10,
        type: "0"
      },
      quotelList: [],
      quotelTotal: 0,
      unitVisible: false,
      unitDate: {
        pageNum: 1,
        pageSize: 10,
        type: "",
        orgName: ""
      },
      unitTotal: 0,
      unitList: [],
      unitPitch: [],

      tableData: [],
      pickerOptionsEnd: {
        disabledDate: time => {
          if (this.listQuery.beginTime) {
            let d;
            if (typeof this.listQuery.beginTime == "string") {
              d = new Date(this.listQuery.beginTime).getTime();
            } else {
              d = this.listQuery.beginTime.getTime();
            }
            return time.getTime() < d;
          }
        }
      },
      pickerOptionsAnd: {
        disabledDate: time => {
          if (this.listQuery.endTime) {
            let d;
            if (typeof this.listQuery.endTime == "string") {
              d = new Date(this.listQuery.endTime).getTime();
            } else {
              d = this.listQuery.endTime.getTime();
            }
            return time.getTime() > d;
          }
        }
      },
      infoDialog: false,
      dialogTitle: "",
      dialogVisible: false,
      dialogForm: {},
      dialogType: "",
      checkList: [],
      personnelVisible: false,
      departmentList: [],
      department: "-1",
      orgPage: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      orgList: [],
      multipleSelection: [],
      receiveddir: "0",
      fileList: [],
      transmitVisible: false,
      transmitForm: {
        articleTitle: "",
        type: ""
      },
      companyList: [],
      notOrgId: "",
      receiverShow: false,
      receiverList: [],
      receiverTo: "",
      checked: false,
      ImgDialog: false,
      dialogImageUrl: "",
      informationTitle: "",
      newAddList: [],
      delList: [],
      saveHtml: "",
      orgName: ""
    };
  },
  mounted() {
    if (this.user.orgType == 2) {
      //   this.cooperator = [
      //     { name: "全部", id: "" },
      //     { name: "监理公司", id: "1" },
      //     { name: "设计院", id: "5" },
      //     { name: "项目部", id: "2" }
      //   ];
      // } else if (this.user.orgType == 3 || this.user.orgType == 9) {
      //   this.cooperator = [
      //     { name: "全部", id: "" },
      //     { name: "建设单位", id: "0" },
      //     { name: "项目部", id: "2" }
      //   ];
      // } else if (this.user.orgType == 4 || this.user.orgType == 5) {
      //   this.cooperator = [
      //     { name: "全部", id: "" },
      //     { name: "上级单位", id: "6" },
      //     { name: "供应商", id: "3" },
      //     { name: "分包单位", id: "4" }
      //   ];
      // } else if (this.user.orgType == 6 || this.user.orgType == 7) {
      //   this.cooperator = [
      //     { name: "全部", id: "" },
      //     { name: "项目部", id: "2" }
      //   ];
    }
    this.searchCompanyRole();
    this.getAllProjectInfo();
    this.waitReceived();
    this.search();
    this.getOrgAllDeptList();

    this.searchCompany();
  },
  methods: {
    searchCompanyRole() {
      this.$api.searchCompanyRole().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.name = item.companyName;
            item.id = item.type;
          });
          this.cooperator = res.data;
          this.cooperator.unshift({ name: "全部", id: "" });
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    sendingTypeChange() {
      this.checkList = [];
    },
    imgPreview(item) {
      console.log("item -----> ", item);
      this.dialogImageUrl = item.path;
      this.ImgDialog = true;
    },
    receiverEnsure() {
      let data = {
        enableStatus: 1,
        fkUserId: this.receiverTo,
        setType: 2
      };
      this.loading = true;
      this.$api.configurationSetPost(data).then(res => {
        this.loading = false;
        if (res.code == 200) {
          this.$message.success("操作成功");
          this.receiverClose();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    receiver() {
      this.$api.findSysUserListByOrgId({ orgId: this.user.fkOrgId }).then(res => {
        if (res.code == 200) {
          this.receiverList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
      this.$api.configurationSet({ setType: 2 }).then(res => {
        if (res.code == 200) {
          this.receiverShow = true;
          this.receiverTo = res.data.fkUserId;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    receiverClose() {
      this.receiverShow = false;
    },
    transmitFormChange() {
      this.checkList = [];
    },
    projectIdChange() {
      this.listQuery.customId = "";
      this.searchCompany();
    },
    searchCompany() {
      this.companyList = [];
      let data = { projectId: this.listQuery.projectId };
      this.$api.searchCompany(data).then(res => {
        if (res.code == 200) {
          this.companyList = res.data;
          this.companyList.unshift({ pkId: "", customName: "全部" });
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 转发
    transmit(row) {
      // .pkId
      this.dialogType = "";
      this.notOrgId = row.fkOrgId;
      this.checkList = [];
      this.$api.oaArticleFindById({ pkId: row.pkId }).then(res => {
        if (res.code === 200) {
          this.transmitForm = {
            articleTitle: res.data.articleTitle,
            type: "0",
            pkId: res.data.pkId,
            meetingEndTime: "",
            meetingPlace: "",
            meetingStartTime: "",
            noticeAbstract: "",
            speaker: "",
            rotationUrl: "",
            publishing: ""
          };
          this.saveHtml = res.data.articleContent;
          this.checked = false;
          if (res.data.enclosures.length) {
            res.data.enclosures.forEach(item => {
              item.name = item.enclosureName;
              item.path = item.enclosureUrl;
            });
            this.fileList = res.data.enclosures;
          } else {
            this.fileList = [];
          }

          this.dialogForm.articleContent = res.data.articleContent;
          this.transmitVisible = true;
          this.dialogForm.userName = res.data.orgName;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    transmiDialog() {
      this.transmitVisible = false;
    },
    transmitPreserve(val) {
      // enableStatus:this.dialogForm.enableStatus
      // myEditor
      let date = { ...this.transmitForm, articleContent: this.$refs.articleContent, enableStatus: val };
      console.log(date);
      if (["1", "2"].includes(date.type)) {
        if (this.checked) {
          date.publishing = 0;
        } else {
          date.publishing = 1;
        }
      } else {
        delete date.publishing;
        delete date.rotationUrl;
      }
      if (date.type != 4) {
        date.userIds = [];
        if (this.checkList.length != 0) {
          this.checkList.forEach(item => {
            date.userIds.push(item.id);
          });
        }
      } else {
        date.articleReceives = [];
        if (this.checkList.length != 0) {
          this.checkList.forEach(item => {
            date.articleReceives.push({ fkOrgId: item.id, customerName: item.name });
          });
        }
      }
      articleContent: if (this.$refs.myEditor) {
        date.articleContent = this.$refs.myEditor.html;
      }
      date.enclosures = [];
      if (this.fileList.length != 0) {
        this.fileList.forEach(item => {
          date.enclosures.push({ enclosureName: item.name, enclosureUrl: item.path });
        });
      }
      this.loading = true;
      this.$api.oaArticleForward(date).then(res => {
        this.loading = false;
        if (res.code == 200) {
          this.$message.success(res.msg);
          this.search();
          this.transmiDialog();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 上传
    uploading() {
      this.$refs.files.click();
    },
    fileRemove(item, idx) {
      this.delList.push(item.enclosureUrl);
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
            console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
            const path = "https://" + data.Location;
            _this.newAddList.push(path);
            const imgIdx = path.lastIndexOf("com/");
            const imgName = path.substring(imgIdx + 4, path.length);
            _this.fileList.push({ name: imgName, path });
            console.log(_this.fileList);
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
    // 选择发送单位
    sendingUnit(val) {
      if (val == 0) {
        this.unitDate = {
          pageNum: 1,
          pageSize: 10,
          type: "",
          orgName: ""
        };
      } else {
        this.unitDate = {
          pageNum: 1,
          pageSize: 10,
          type: "",
          orgName: "",
          notOrgId: this.notOrgId
        };
      }

      this.cooperationCompany();
      this.unitVisible = true;
    },
    unitDialog() {
      this.unitVisible = false;
    },
    unitDateChange() {
      this.unitDate.pageNum = 1;
      this.unitDate.pageSize = 10;
      this.cooperationCompany();
    },
    orgNameInput() {
      this.unitDate.pageNum = 1;
      this.unitDate.pageSize = 10;
      this.cooperationCompany();
    },
    // 分页查询合作单位
    cooperationCompany() {
      this.$api.cooperationCompany(this.unitDate).then(res => {
        if (res.code == 200) {
          this.unitList = res.data.records;
          this.unitTotal = res.data.total - 0;
          console.log("Xxxxxxxxxxxxx------------xxxxxxxxxxxxxx");
          console.log(this.checkList);
          if (this.checkList.length && this.unitList.length) {
            this.unitList.forEach((item, idx) => {
              this.checkList.forEach(e => {
                if (item.pkId == e.pkId) {
                  // alert(1111)
                  // this.$refs.multipleTable.toggleRowSelection(item,true)
                }
              });
            });
          }
          // this.$refs.multipleTable.toggleRowSelection(row);
          console.log("Xxxxxxxxxxxxx------------xxxxxxxxxxxxxx");
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    unitSelectionChange(val) {
      console.log(val);
      this.unitPitch = val;
    },
    // 选择单位确认
    unitEnsure() {
      this.unitPitch.forEach(item => {
        item.name = item.customName;
        item.id = item.pkId;
        this.checkList.push(item);
      });
      this.checkList = this.unique(this.checkList);
      this.unitDialog();
    },
    // 页数改变事件
    unitSizeChange(pageSize) {
      this.unitDate.pageSize = pageSize;
      this.cooperationCompany();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 页码改变事件
    unitCurrentChange(currentPage) {
      this.unitDate.pageNum = currentPage;
      this.cooperationCompany();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },

    // 引用
    quote() {
      this.quotelDate.type = "0";
      this.quotelVisible = true;
      this.oaArticleQuoteArticle();
    },
    quotelTypeChange() {
      this.quotelDate = {
        pageNum: 1,
        pageSize: 10,
        type: this.quotelDate.type
      };
      this.oaArticleQuoteArticle();
    },
    quotelDialog() {
      this.quotelVisible = false;
    },
    // 引用选择
    referenceSelection(row) {
      console.log(row);
      this.dialogForm.articleTitle = row.articleTitle;
      this.dialogForm.articleContent = row.articleContent;
      this.quotelDialog();
    },
    // 页数改变事件
    quotelSizeChange(pageSize) {
      this.quotelDate.pageSize = pageSize;
      this.oaArticleQuoteArticle();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 页码改变事件
    quotelCurrentChange(currentPage) {
      this.quotelDate.pageNum = currentPage;
      this.oaArticleQuoteArticle();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    oaArticleQuoteArticle() {
      this.$api.oaArticleQuoteArticle(this.quotelDate).then(res => {
        if (res.code == 200) {
          this.quotelList = res.data.records;
          this.quotelTotal = res.data.total - 0;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },

    waitReceived() {
      this.$api.waitReceived().then(res => {
        if (res.code == 200) {
          this.receiveddir = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    getAllProjectInfo() {
      this.$api.getAllProjectInfo().then(res => {
        if (res.code == 200) {
          console.log(res);
          this.projectList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    typeChange() {
      this.listQuery = {
        pageNum: 1,
        pageSize: 10,
        enableStatus: "",
        keyWord: "",
        projectId: "",
        customId: "",
        beginTime: "",
        endTime: "",
        type: this.listQuery.type
      };
      this.search();
    },

    remove(idx) {
      this.checkList.splice(idx, 1);
    },
    ensure() {
      this.multipleSelection.forEach((item, index) => {
        item.id = item.pkId;
        item.name = item.userName;
        this.checkList.push(item);
      });
      this.checkList = this.unique(this.checkList);
      this.personnelVisible = false;
    },
    unique(arr) {
      const res = new Map();
      return arr.filter(arr => !res.has(arr.id) && res.set(arr.id, 1));
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    getOrgAllDeptList() {
      this.$api.getOrgAllDeptList().then(res => {
        if (res.code == 200) {
          this.departmentList = res.data;
          this.departmentList.unshift({ deptName: "全部", pkId: "-1" });
        } else {
        }
      });
    },
    choice() {
      this.department = "-1";
      this.personnelVisible = true;

      this.getUserPageList();
    },
    selDeptChange(){
      this.orgPage.pageNum = 1
      this.getUserPageList()
    },
    getUserPageList() {
      let data = { ...this.orgPage };
      data.orgId = this.user.fkOrgId;
      data.deptId = this.department;
      this.$api.getUserPageList(data).then(res => {
        if (res.code == 200) {
          this.orgList = res.data.records;
          this.total = res.data.total - 0;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 页数改变事件
    orgSizeChange(pageSize) {
      this.orgPage.pageSize = pageSize;
      this.getUserPageList();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 页码改变事件
    orgCurrentChange(currentPage) {
      this.orgPage.pageNum = currentPage;
      this.getUserPageList();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },

    personnelDialog() {
      this.personnelVisible = false;
    },
    openInfoDialog(row, type) {
      if (type == 1) {
        if (this.listQuery.type == 0) {
          this.informationTitle = "发文信息";
        } else {
          this.informationTitle = "文章信息";
        }
        this.oaMeetingfindById(row.pkId, true);
      } else {
        this.dialogType = "1";
        this.dialogTitle = "发文信息";
        this.oaMeetingfindById(row.pkId);
      }
    },
    compile(pkId) {
      this.dialogType = "";
      this.dialogTitle = "编辑文章";
      this.oaMeetingfindById(pkId);
    },
    copyNew(pkId) {
      this.dialogType = "";
      this.dialogTitle = "新增发文";
      this.oaMeetingfindById(pkId);
    },
    closeInfoDialog() {
      this.infoDialog = false;
      this.dialogForm = {
        articleContent: "",
        articleTitle: ""
      };
    },
    oaMeetingfindById(pkId, bool) {
      this.$api.oaArticleFindById({ pkId }).then(res => {
        if (res.code === 200) {
          this.dialogForm = res.data;
          this.checkList = [];
          if (res.data.articleReceives != null) {
            res.data.articleReceives.forEach(item => {
              item.id = item.fkOrgId;
              item.name = item.customerName;
            });
            this.checkList = res.data.articleReceives;
          }
          if (res.data.users != null) {
            res.data.users.forEach(item => {
              item.id = item.fkUserId;
              item.name = item.userName;
            });
            this.checkList = res.data.users;
          }
          if (res.data.enclosures != null) {
            res.data.enclosures.forEach(item => {
              item.path = item.enclosureUrl;
              item.name = item.enclosureName;
            });
            this.fileList = res.data.enclosures;
          } else {
            this.fileList = [];
          }

          if (bool) {
            this.infoDialog = true;
          } else {
            this.dialogVisible = true;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    add() {
      this.dialogType = "";
      this.dialogForm.userName = this.user.userName;
      this.dialogForm.sendingType = 0;
      this.fileList = [];
      this.checkList = [];
      this.dialogTitle = "新增发文";
      this.dialogVisible = true;
    },
    preserve(enableStatus) {
      let date = { ...this.dialogForm, enableStatus, articleContent: this.$refs.myEditor.html };
      console.log(date);
      if(this.$refs.myEditor.loading){
        return this.$message.warning("文章内容加载中")
      }
      if (!date.articleTitle) {
        return this.$message.warning("请填写文章标题");
      }
      if (this.checkList.length == 0) {
        return this.$message.warning(this.dialogForm.sendingType === 0 ? "请填选择参发送单位" : "请填选择参发送人员");
      } else {
        date.articleReceives = [];
        date.userIds = [];
        this.checkList.forEach(item => {
          if (this.dialogForm.sendingType === 0) {
            date.articleReceives.push({ fkOrgId: item.id, customerName: item.name });
          } else {
            date.userIds.push(item.id);
          }
        });
      }

      // return console.log(this.checkList) this.fileList
      date.enclosures = [];
      if (this.fileList.length != 0) {
        this.fileList.forEach(item => {
          date.enclosures.push({ enclosureName: item.name, enclosureUrl: item.path });
        });
      }
      // enclosures
      this.loading = true;
      if (this.dialogTitle == "新增发文") {
        this.$api.oaArticleAdd(date).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.$message.success("新增成功");
            this.closeDialog(true);
            this.search();
          } else {
            this.$message.warning(res.msg);
          }
        });
      } else {
        this.$api.oaArticleUpdate(date).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.$message.success("编辑成功");
            this.closeDialog(true);
            this.search();
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    closeDialog(isDel) {
      if (this.$refs.myEditor) {
        let arr = getStringImgSrc(this.$refs.myEditor.html);
        let arr2 = JSON.parse(JSON.stringify(this.$refs.myEditor.newAddList));
        if (!isDel) {
          this.delList = [];
          this.delFiles(isDel, arr, arr2);
        } else {
          this.newAddList = [];
          this.$refs.myEditor.newAddList = [];
          this.delFiles(isDel, arr);
        }
        this.$refs.myEditor.html = "";
      }
      this.dialogVisible = false;
      this.saveHtml = "";
      this.checkList = [];
      this.dialogForm = {
        articleContent: "",
        articleTitle: ""
      };
    },
    delFiles(isDel, newImgList, ediNewAddList) {
      let urls = [];
      let imgList = getStringImgSrc(this.saveHtml);
      let arr = [];
      let ediDelList = [];

      if (newImgList && newImgList.length) {
        if (imgList.length) {
          imgList.forEach(item => {
            if (!newImgList.includes(item)) {
              arr.push(item);
            }
          });
        }
      } else {
        arr = !isDel ? imgList : [];
      }
      ediNewAddList &&
        ediNewAddList.forEach(item => {
          if (!newImgList.includes(item)) {
            ediDelList.push(item);
          }
        });
      if (!isDel) {
        if (this.dialogType === 2) {
          urls = [...this.newAddList, ...ediNewAddList].join(",");
        } else {
          urls = [...new Set([...this.delList, ...this.newAddList, ...arr, ...ediDelList])].join(",");
        }
      } else {
        urls = [...new Set([...this.delList, ...ediDelList])].join(",");
      }
      if (urls.length) {
        console.log(urls, this.delList, this.newAddList, newImgList, ediNewAddList);
        this.newAddList = [];
        this.delList = [];
        this.$api.delFiles({ urls });
      }
    },
    // 删除
    expurgate(pkId) {
      const _this = this;
      _this
        .$confirm("确定删除该发文信息？", "删除确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.$api.oaArticleDelete({ pkId }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: res.msg
              });
              this.search();
            } else {
              this.$message({
                type: "error",
                message: res.msg
              });
            }
          });
        })
        .catch(() => {});
    },
    // 取消
    cancel(pkId) {
      const _this = this;
      _this
        .$confirm("确定撤回该发文？", "撤回确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.$api.withdrawOaArticle({ pkId }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: res.msg
              });
              this.search();
            } else {
              this.$message({
                type: "error",
                message: res.msg
              });
            }
          });
        })
        .catch(() => {});
    },
    // 接收
    reception(pkId) {
      const _this = this;
      _this
        .$confirm("确定接收该发文？", "接收确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          this.$api.receiveOaArticle({ pkId }).then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: res.msg
              });
              this.waitReceived();
              this.search();
            } else {
              this.$message({
                type: "error",
                message: res.msg
              });
            }
          });
        })
        .catch(() => {});
    },
    // 查询
    search() {
      this.listQuery.pageNum = 1;
      this.listQuery.pageSize = 10;
      console.log(this.listQuery.pageSize);
      this.getOrgPageList();
    },
    // 页数改变事件
    pageSizeChange(pageSize) {
      this.listQuery.pageSize = pageSize;
      this.getOrgPageList();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 页码改变事件
    pageCurrentChange(currentPage) {
      this.listQuery.pageNum = currentPage;
      this.getOrgPageList();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },

    getOrgPageList() {
      let data = { ...this.listQuery };
      delete data.customId;
      delete data.projectId;
      data.orgId = this.listQuery.customId.length == 0 ? this.listQuery.projectId : this.listQuery.customId;
      this.loading = true;
      this.$api.oaArticleSearchPage(data).then(res => {
        if (res.code == 200) {
          // const options = {
          //   0: "草稿",
          //   1: "待接收",
          //   2: "部分接收",
          //   3: "已撤回",
          //   4: "已接收",
          // };
          // res.data.records.forEach(item => {
          //   item.enableStatusName = options[item.enableStatus];
          // });
          this.tableData = res.data.records;
          this.totalCount = res.data.total - 0;
          this.loading = false;
          this.waitReceived();
        } else {
          this.loading = false;
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    clickUpload() {
      this.$refs.imgFiles.click();
    },
    // // 获取签名
    upLoadsImg(sign, folder, file, filename, tmpSecretKey, tmpSecretId, startTime, expiredTime) {
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
            _this.transmitForm.rotationUrl = path;
            _this.loading = false;
            _this.$message({
              type: "success",
              message: "上传成功"
            });
            _this.$refs.imgFiles.value = "";
          } else {
            _this.$refs.imgFiles.value = "";
            _this.loading = false;
            _this.$message({
              type: "error",
              message: "上传失败"
            });
          }
        }
      );
    },
    uploadImg() {
      const fileObj = document.getElementById("uploadImg").files[0];
      const blobFile = this.$options.methods.dataURLtoBlob.bind(this)(fileObj);
      const filename = fileObj.name;
      if (!["image/png", "image/jpeg", "image/jpg"].includes(fileObj.type)) {
        return this.$message.warning("仅支持上传jpeg，jpg，png类型的图片");
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
            this.$options.methods.upLoadsImg.bind(this)(sign, path, blobFile, filename, res.data.tmpSecretKey, res.data.tmpSecretId, res.data.startTime, res.data.expiredTime);
          } else {
            this.$refs.imgFiles.value = "";
            this.loading = false;
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        })
        .catch(err => {
          this.$refs.imgFiles.value = "";
          this.loading = false;
        });
    },
    // // DataURL转Blob
    // dataURLtoBlob(fileObj) {
    //   return new Blob([fileObj], { type: fileObj.type });
    // },
    // 预览图片
    perImg(row) {
      console.log(row);
      this.dialogImageUrl = row;
      this.ImgDialog = true;
    },
    // 删除图片
    delImg() {
      this.delList.push(this.transmitForm.rotationUrl);
      this.transmitForm.rotationUrl = "";
    }
  }
};
</script>

<style lang="scss" scoped>
.search-mr {
  position: relative;
  font-size: 14px;
}

.header-seach {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f3f3f3;
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

.add {
  position: absolute;
  right: 8px;
}

// /deep/ .el-dialog__header {
//   background: #ccc;
//   height: 40px;
// }
.m-left {
  margin-left: 8px;
}

el-row-data {
  display: flex;
  flex-wrap: wrap;
}

.dialog-form {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
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

    .alabels {
      vertical-align: top;
      display: flex;
      width: 80px;
      flex-direction: column;
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
  }
}
// .labels::after {
//   content: "*";
//   color: red;
//   display: inline-block;
//   position: relative;
//   left: 5px;
//   top: 12px;
//   transform: translateY(-50%);
// }

.mb-10 {
  margin-bottom: 10px;
}

.iconsColor {
  font-size: 16px;
  color: #3aa1ff;
}

.uploadDiv {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 90px;
  //   margin: 0 20px 20px 20px;
  border: 1px dashed #c0ccda;
  cursor: pointer;

  .uploadIcon {
    font-size: 30px;
    color: #c0ccda;
  }
}

.imgList {
  display: flex;
  //   justify-content: space-evenly;
  flex-wrap: wrap;
  width: 100%;

  .imgs {
    position: relative;

    // margin: 0 20px 20px 20px;
    // margin-bottom: 20px;
    img {
      width: 150px;
      height: 90px;
    }

    .mask {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      width: 150px;
      height: 90px;
      background-color: rgba(0, 0, 0, 0);
      z-index: 5;

      .maskIcon {
        display: none;
        color: #fff;
        font-size: 30px;
        cursor: pointer;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.3);
        transition: 0.5s;

        .maskIcon {
          display: flex;
        }
      }
    }
  }
}
.fs-input {
  width: 200px;
}
.prevDialog {
  width: 100%;
  height: 600px;
  overflow: auto;
  text-align: center;
}

.editor {
  width: 100%;
  height: 380px;
  overflow: auto;
  border: 1px solid #cccccc;
}

.infoDialog {
  padding: 20px;
  height: 700px;
  overflow: auto;

  .infoDialog-head {
    text-align: center;

    .sendInfo {
      display: flex;
      justify-content: flex-end;
    }
  }

  .overDiv {
    height: 550px;
    overflow: auto;
  }
}

.mr-20 {
  margin-right: 20px;
}

.wh-150 {
  width: 150px;
}

.receiveddir {
  width: 15px;
  height: 15px;
  background: red;
  color: #fff;
  font-size: 12px;
  text-align: center;
  border-radius: 50%;
  position: absolute;
  top: -5px;
  left: 106px;
}

.check-list {
  position: relative;
  display: inline-block;
  margin: 4px;
  background: #fff;
  border: 1px solid;
  padding: 3px 15px;
}

.close-remove {
  color: red;
  position: absolute;
  right: 3px;
  top: 0px;
}

.close-remove:hover {
  cursor: pointer;
}

.upLoad-show {
  height: 80px;
  overflow: auto;
}
/deep/ .el-tabs__header {
  background-color: #fff;
}
/deep/ .el-tabs__nav-wrap {
  padding-left: 20px;
}
.ellipsistwo {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
