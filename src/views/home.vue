<template>
  <div v-loading="loading2">
    <div class="home-box">
      <!-- 左侧 -->
      <div class="box-left">
        <!-- 新闻通知 -->
        <div class="inform">
          <div style="position: relative;">
            <div class="inform-title mouse" :class="{ 'pitch-on': pitchOn == 1 }" @click="informClick(1)">
              公司新闻
              <span v-if="newsRedPoint"></span>
            </div>
            <div class="inform-title mouse" :class="{ 'pitch-on': pitchOn == 2 }" @click="informClick(2)">
              公司公告
              <span v-if="noticeRedPoint"></span>
            </div>
            <!-- <div class="inform-title mouse" :class="{ 'pitch-on': pitchOn == 3 }" @click="informClick(3)" v-if="!user.isMaster"> -->
            <div class="inform-title mouse" :class="{ 'pitch-on': pitchOn == 3 }" @click="informClick(3)">
              会议通知
              <span v-if="notifyRedPoint"></span>
            </div>
            <div style="position: absolute;right: 0;top: 8px;">
              <!-- 会议通知 -->
              <router-link v-if="pitchOn == 1" to="/home/news" style="font-size: 13px;color: #a5a5a5;" class="right">查看更多>></router-link>
              <!-- 新闻 -->
              <router-link v-if="pitchOn == 2" to="/home/affiche" style="font-size: 13px;color: #a5a5a5;" class="right">查看更多>></router-link>
              <!-- 公告 -->
              <router-link v-if="pitchOn == 3" to="/home/notice" style="font-size: 13px;color: #a5a5a5;" class="right">查看更多>></router-link>
            </div>
          </div>

          <div class="inform-content">
            <div class="inform-content-item mr-20">
              <div class="item-top" v-if="informList.length >= 1" @click="openInfoDialog(pitchOn, informList[0])">
                <img width="100%;" height="100%" :src="pitchOn != 3 ? informList[0].rotationUrl : defaultImg0" />
                <div v-if="pitchOn != 3" class="inform-content-text">{{ informList[0].noticeTitle }}</div>
                <div v-else class="inform-content-text">{{ informList[0].meetingTitle }}</div>
                <span class="item-status" :class="{ 'btn-status': informList[0].status == 2 }" v-if="informList[0].status != 1">{{ informList[0].status == 0 ? "NEW" : "我发布" }}</span>
              </div>
              <div class="wu-states" v-else>
                <img width="100%;" height="100%" :src="pitchOn == 1 ? xinwen : pitchOn == 2 ? gonggao : pitchOn == 3 ? huiyi : ''" />
                <p v-if="pitchOn == 1">暂无更多新闻</p>
                <p v-if="pitchOn == 2">暂无更多公告</p>
                <p v-if="pitchOn == 3">暂无更多会议</p>
              </div>
            </div>
            <div class="inform-content-item mr-20">
              <div class="item-top" v-if="informList.length >= 2" @click="openInfoDialog(pitchOn, informList[1])">
                <img width="100%;" height="100%" :src="pitchOn != 3 ? informList[1].rotationUrl : defaultImg1" />
                <div v-if="pitchOn != 3" class="inform-content-text">{{ informList[1].noticeTitle }}</div>
                <div v-else class="inform-content-text">{{ informList[1].meetingTitle }}</div>
                <span class="item-status" :class="{ 'btn-status': informList[1].status == 2 }" v-if="informList[1].status != 1">{{ informList[1].status == 0 ? "NEW" : "我发布" }}</span>
              </div>
              <div class="wu-states" v-else>
                <img width="100%;" height="100%" :src="pitchOn == 1 ? xinwen : pitchOn == 2 ? gonggao : pitchOn == 3 ? huiyi : ''" />
                <p v-if="pitchOn == 1">暂无更多新闻</p>
                <p v-if="pitchOn == 2">暂无更多公告</p>
                <p v-if="pitchOn == 3">暂无更多会议</p>
              </div>
            </div>
            <div class="inform-content-item">
              <div class="item-top" v-if="informList.length >= 3" @click="openInfoDialog(pitchOn, informList[2])">
                <img width="100%;" height="100%" :src="pitchOn != 3 ? informList[2].rotationUrl : defaultImg2" />
                <div v-if="pitchOn != 3" class="inform-content-text">{{ informList[2].noticeTitle }}</div>
                <div v-else class="inform-content-text">{{ informList[2].meetingTitle }}</div>
                <span class="item-status" :class="{ 'btn-status': informList[2].status == 2 }" v-if="informList[2].status != 1">{{ informList[2].status == 0 ? "NEW" : "我发布" }}</span>
              </div>
              <div class="wu-states" v-else>
                <img width="100%;" height="100%" :src="pitchOn == 1 ? xinwen : pitchOn == 2 ? gonggao : pitchOn == 3 ? huiyi : ''" />
                <p v-if="pitchOn == 1">暂无更多新闻</p>
                <p v-if="pitchOn == 2">暂无更多公告</p>
                <p v-if="pitchOn == 3">暂无更多会议</p>
              </div>
            </div>
            <!-- <div v-if="informList.length == 0" style="width: 100%;;text-align: center;">
              <img src="@/assets/empty.svg" width="150px" style="margin-top:30px" class="zanwu" />
              <div style="font-size:14px">暂无数据</div>
            </div> -->
          </div>
        </div>

        <!-- 项目概况 -->
        <div class="project-overview">
          <div class="project-overview-title">
            <span class="title-left"></span>
            <span>项目概况</span>

            <el-select v-model="dept" size="mini" class="wh-120-2" v-if="selectShow" @change="deptChange" style=" position: absolute;top: 0px;right: 0px;width: 100px;color: #3E4255FF;height: 34px;">
              <el-option v-for="item in options" :key="item.fkOrgId" :value="item.fkOrgId" :label="item.projectOrgName"></el-option>
            </el-select>
          </div>
          <!--项目信息 -->
          <div class="item-information">
            <div class="item-information-box">
              <div class="information-box-item">
                <div class="box-item-title">
                  <div class="box-item-text">建设单位</div>
                  <div class="box-item-content" :title="projectInfo.investorName">{{ projectInfo.investorName }}</div>
                </div>
                <div class="box-item-title">
                  <div class="box-item-text">项目地址</div>
                  <div class="box-item-content" :title="projectInfo.detailAddress">{{ projectInfo.detailAddress }}</div>
                </div>
                <div class="box-item-title"><span class="box-item-text">开工日期</span>{{ projectInfo.beginTime }}</div>

                <div class="box-item-title">
                  <span class="box-item-text">项目工期</span>
                  <div class="box-item-content" :title="projectInfo.duration">{{ projectInfo.duration }}</div>
                </div>
                <div class="box-item-title"><span class="box-item-text">施工单位</span>{{ projectInfo.contractorName }}</div>
                <div class="box-item-title"><span class="box-item-text">竣工日期</span>{{ projectInfo.endTime }}</div>
              </div>

              <!-- <div  style="display: flex;height: 45px;font-size: 14px;"><span
                  style="color: #828282;font-size: 14px;">项目描述</span><span
                  style="text-overflow:ellipsis;overflow: hidden; white-space: nowrap;max-width:370px ;">:{{
                    projectInfo.remark }}</span>
              </div> -->
            </div>

            <!--环形图表-->
            <div style="width: 50%;height: 154px;">
              <!-- <Echart :option="option" echartName="myEchart" mystyle="width:30vw;height:140px" /> -->
              <Echart :option="option2" echartName="myEchart2" mystyle="width:30vw;height:154px;" />
            </div>
          </div>

          <div class="FinishedOutput">
            <span class="title-left"></span>
            <div class="title-left-size">完成产值</div>
          </div>

          <!--柱形图表-->
          <div class="echartsClass-1">
            <div class="FinishedOutput-wan">(单位:万元)</div>
            <Echart class="echartsClass" :option="option" echartName="myEchart" mystyle="width:100%;height:300px;left: -65px;top: -31px;width:1377px;" />
          </div>
        </div>
      </div>
      <!-- 右侧 -->
      <div class="box-right">
        <!-- 日历 -->
        <calendar ref="calendar" style="width: 100%;" @handleClick="handleClick"></calendar>
        <!--待办事项-->

        <div class="backlog">
          <div class="backlog-title-box">
            <div class="backlog-title-left">
              <span class="title-left"></span>
              <span class="backlog-title-text">待办事项</span>
            </div>

            <router-link to="/home/todo" class="even-more">查看更多</router-link>
            <!-- <span class="">查看更多>></span> -->
          </div>
          <div class="backlog-center-box">
            <div v-if="todoList.length">
              <div class="backlog-item" v-for="item in todoList" :key="item.pkId" @click="openApproveDialog(item)">
                <div class="backlog-item-text">
                  <span class="backlog-item-dot"></span>
                  {{ item.title }}
                </div>
                <div class="backlog-details">
                  <div class="userName">{{ user.userName }}</div>
                  <div class="lines">|</div>
                  <div>{{ transTime(item.createTime) }}</div>
                </div>
                <i class="el-icon-arrow-right backlog-ico"></i>
              </div>
            </div>
            <div v-else style="text-align: center;">
              <img src="@/assets/empty.svg" width="120px" style="margin-top:25%" class="zanwu" />
              <div style="font-size:14px">暂无数据</div>
            </div>
          </div>
        </div>

        <!-- 小工具 -->
        <div class="gadget-box">
          <div class="gadget-box-title">
            <span class="title-left"></span>
            <span class="gadget-box-text">小工具</span>
          </div>
          <el-row style="margin-top:16px">
            <el-col :span="8">
              <div class="gadget-box-item" :class="{ 'gadget-pitch': gadgetPitch == 1 }" @click="gadgetClick(1)">
                <div class="img-box" style="background:repeating-linear-gradient(to right,#77a6cb,#9bc4e4);">
                  <img class="gadget-img" src="@/assets/jsq.png" alt="" />
                </div>
                <div class="item-text">计算器</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="gadget-box-item" :class="{ 'gadget-pitch': gadgetPitch == 2 }" @click="gadgetClick(2)">
                <div class="img-box" style="background:repeating-linear-gradient(to right,#05c1cd,#16e4b9);">
                  <img class="gadget-img" src="@/assets/lj.png" alt="" />
                </div>
                <div class="item-text">单位换算</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="gadget-box-item" :class="{ 'gadget-pitch': gadgetPitch == 3 }" @click="gadgetClick(3)">
                <div class="img-box" style="background:repeating-linear-gradient(to right,#ff6643,#ff8d61);">
                  <img class="gadget-img" src="@/assets/huisuan.png" alt="" />
                </div>
                <div class="item-text">汇率换算</div>
              </div>
            </el-col>
          </el-row>
          <el-row style="margin-top:16px">
            <el-col :span="8">
              <div class="gadget-box-item" :class="{ 'gadget-pitch': gadgetPitch == 4 }" @click="gadgetClick(4)">
                <div class="img-box" style="background:repeating-linear-gradient(to right,#3d8afc,#40abff);">
                  <img class="gadget-img" src="@/assets/ly.png" alt="" />
                </div>
                <div class="item-text">天气</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="gadget-box-item" :class="{ 'gadget-pitch': gadgetPitch == 5 }" @click="gadgetClick(5)">
                <div class="img-box" style="background:repeating-linear-gradient(to right,#fc8e3d,#ffbe40);">
                  <img class="gadget-img" src="@/assets/shjian.png" alt="" />
                </div>
                <div class="item-text">时钟</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="gadget-box-item" :class="{ 'gadget-pitch': gadgetPitch == 6 }" @click="gadgetClick(6)">
                <div class="img-box" style="background:repeating-linear-gradient(to right,#1cbcff,#40e2ff);">
                  <img class="gadget-img" src="@/assets/wzhi.png" alt="" />
                </div>
                <div class="item-text">常用网站</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
    <!-- 首页头部
    <div class="home-top">
      <div class="home-top-item">
        <div class="item-header">
          <span class="left">待办事项</span>
          <router-link to="/home/todo" class="right">更多 》</router-link>
        </div>
        <ul class="item-main" v-if="todoList.length">
          <li v-for="item in todoList" :key="item.pkId" @click="openApproveDialog(item)">
            <span class="article"><img src="../assets/todo.svg" alt="" class="titleIcon" />{{ item.title }}</span>
            <span class="article-time">{{ item.createTime }}</span>
          </li>
        </ul>
        <span v-else>暂无待办事项</span>
      </div>
      <div class="home-top-item">
        <div class="item-header">
          <span class="left">会议通知</span>
          <router-link to="/home/notice" class="right">更多 》</router-link>
        </div>
        <ul class="item-main" v-if="meetList.length">
          <li v-for="item in meetList" :key="item.pkId" @click="openInfoDialog(1, item)">
            <span class="article"><img src="../assets/tongzhi.svg" alt="" class="titleIcon" />{{ item.topic }}</span>
            <span class="article-time">{{ item.sendingTime }}</span>
          </li>
        </ul>
        <span v-else>暂无会议通知</span>
      </div>
      公司新闻
      <div class="home-top-item">
        <div class="item-header">
          <span class="left">公司新闻</span>
          <router-link to="/home/news" class="right">更多 》</router-link>
        </div>
        <ul class="item-main" v-if="newsList.length">
          <li v-for="item in newsList" :key="item.pkId" @click="openInfoDialog(2, item)">
            <span class="article"><img src="../assets/xinwen.svg" alt="" class="titleIcon" />{{ item.noticeTitle }}</span>
            <span class="article-time">{{ item.sendingTime }}</span>
          </li>
        </ul>
        <span v-else>暂无公司新闻</span>
      </div>
      公司公告
      <div class="home-top-item">
        <div class="item-header">
          <span class="left">公司公告</span>
          <router-link to="/home/affiche" class="right">更多 》</router-link>
        </div>
        <ul class="item-main" v-if="afficheList.length">
          <li v-for="item in afficheList" :key="item.pkId" @click="openInfoDialog(3, item)">
            <span class="article"><img src="../assets/gonggao.svg" alt="" class="titleIcon" />{{ item.noticeTitle }}</span>
            <span class="article-time">{{ item.sendingTime }}</span>
          </li>
        </ul>
        <span v-else>暂无公司公告</span>
      </div>

    </div>
    首页内容
    <div class="home-main">
      首页左侧
      <div class="home-main-left">
        柱状图
        <div class="home-main-left-top">
          <div class="header">
            <el-select v-model="dept" size="mini" class="wh-120" v-if="selectShow" @change="deptChange">
              <el-option v-for="item in options" :key="item.pkId" :value="item.pkId" :label="item.projectOrgName"></el-option>
            </el-select>
          </div>
          <div class="main" v-loading="loading">
            <div class="echarts">
              <Echart :option="option" echartName="myEchart" mystyle="width:30vw;height:240px" />
              <Echart :option="option2" echartName="myEchart2" mystyle="width:30vw;height:240px" />
            </div>
          </div>
        </div>
        底部信息和小工具
        <div class="home-main-left-bottom">
          项目信息
          <div class="item-information">
            <div class="header">
              <h1>项目信息</h1>
            </div>
            <ul class="main">
              <li class="main-item">
                <h5>项目名称</h5>
                <span>{{ projectInfo.projectName }}</span>
              </li>
              <li class="main-item">
                <h5>建设单位</h5>
                <span>{{ projectInfo.investorName }}</span>
              </li>
              <li class="main-item">
                <h5>监理单位</h5>
                <span>{{ projectInfo.supervisorName }}</span>
              </li>
              <li class="main-item">
                <h5>施工单位</h5>
                <span>{{ projectInfo.contractorName }}</span>
              </li>
              <li class="main-item">
                <h5>项目部</h5>
                <span>{{ projectInfo.projectOrgName }}</span>
              </li>
              <li class="main-item">
                <h5>工期</h5>
                <span>{{ projectInfo.duration }}</span>
              </li>
              <li class="main-item">
                <h5>开工日期</h5>
                <span>{{ projectInfo.beginTime }}</span>
              </li>
              <li class="main-item">
                <h5>竣工日期</h5>
                <span>{{ projectInfo.endTime }}</span>
              </li>
            </ul>
            <div class="footer">
              <div class="footer-item">
                <h5>项目地址</h5>
                <span class="address">{{ projectInfo.detailAddress }}</span>
              </div>
              <div class="footer-item">
                <h5>项目描述</h5>
                <span class="desc">{{ projectInfo.remark }}</span>
              </div>
            </div>
          </div>
          小工具
          <div class="gadget">
            <el-divider class="dividers">小工具</el-divider>
            <ul>
              <li>
                <a href="https://www.123cha.com/jsq/" target="_blank">
                  <img src="../assets/computed.svg" alt="" class="" />
                  <span>计算器</span>
                </a>
              </li>
              <li>
                <a href="http://www.columbia.edu/~zz2111/unitexchange.htm" target="_blank">
                  <img src="../assets/unit.svg" alt="" class="" />
                  <span>单位换算</span>
                </a>
              </li>
              <li>
                <a href="https://tool.lu/forex/" target="_blank">
                  <img src="../assets/exchangeRate.svg" alt="" class="" />
                  <span>汇率换算</span>
                </a>
              </li>
              <li>
                <a href="https://www.tianqi.com/15tianqi/" target="_blank">
                  <img src="../assets/weather.svg" alt="" class="" />
                  <span>天气</span>
                </a>
              </li>
              <li>
                <a href="https://naozhong.net.cn/shijian/" target="_blank">
                  <img src="../assets/clock.svg" alt="" class="" />
                  <span>时钟</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      首页右侧
      <div class="home-main-right">
        常用功能
        <div class="often-use-route">
          <el-divider class="dividers">常用功能</el-divider>
          <div class="icon">
            <i class="el-icon-setting" @click="openOftenUserDialog"></i>
          </div>
          <ul class="routers">
            <li v-for="item in oftenUseRoute" :key="item.pkId">
              <router-link :to="`/${item.menuUrl}`">{{ item.menuName }}</router-link>
            </li>
          </ul>
        </div>
        日历
        <div class="calendar">
          <el-calendar>
            <template slot="dateCell" slot-scope="{ date, data }">
              <p @click="Test(date, data)">
                {{
                  data.day
                    .split("-")
                    .slice(2)
                    .join("")
                }}
              </p>
              <div class="dateBar" v-for="item in calendarList" :key="item.id" v-show="date > item.startTime && date < item.endTime">
                {{ item.name }}
              </div>
            </template>
          </el-calendar>
        </div>
      </div>
    </div> -->
    <el-dialog :close-on-press-escape="false" title="设置常用功能" :visible.sync="oftenUserDialog" width="30%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <el-tree :data="routes" :props="defaultProps" ref="routeTree" node-key="pkId" :check-strictly="true" show-checkbox default-expand-all> </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="oftenUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="saveOftenUseRoute">保 存</el-button>
      </span>
    </el-dialog>
    <!-- 结算管理审批弹框 -->
    <MyDialog :dialogVisible.sync="dialogVisible" :dialogType="5" :orgType="user.orgType" :pkId="pkId" @updateList="init" :settlementObject="0" @closeLoading="closeLoading" />
    <subDialog :dialogVisible.sync="subDialogVisible" :dialogType="5" :orgType="user.orgType" :pkId="pkId" @updateList="init" :settlementObject="1" @closeLoading="closeLoading" />
    <NodeDialog :nodeDialog.sync="disposeDialog" :show="true" :data="disposeData" :roleDtoName="roleDtoName" :principal="disposeMan" :parentId="pkIdItem" @cableck="init" @cleanData="cleanData" />
    <approvalDialog :appDiaType="2" :showData="designAppData" :approvalTitle="'变更设计审核详情'" :approvalDialog="approvalDialog" @close="approvalDialogClose" @getList="init"></approvalDialog>
    <approveManageementDialog ref="approveManageementDialog" :appDialog.sync="appDialog" :appDialogTitle="'审批盘点单'" :appDialogType="3" @getList="init" @closeLoading="closeLoading"></approveManageementDialog>
    <chapterProcess :chaptersApprovalDialog.sync="chaptersApprovalDialog" :bizType="3" :bizId="bizId" @init="init" :sealPersonStatus="sealPersonStatus"> </chapterProcess>
    <el-dialog :title="renewalTitle" :visible.sync="show2" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="rowDataForm" ref="rowDataForm" class="dialog-form" style="padding-bottom: 8px;">
        <el-form-item label="用户名称" prop="accountName" :label-width="formLabelWidth">
          <el-input v-model="rowDataForm.accountName" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="管理员账号" prop="telephone" :label-width="formLabelWidth">
          <el-input v-model="rowDataForm.telephone" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="账号类型" prop="loginName" :label-width="formLabelWidth">
          <el-input v-model="rowDataForm.orgTypeName" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="续租至" prop="time" :label-width="formLabelWidth">
          <el-date-picker value-format="yyyy-MM-dd" style="width: 100%" disabled v-model="rowDataForm.renewalDate" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="续租凭证" prop="certificate" :label-width="formLabelWidth">
          <picture-upload :apiName="'getUploadFileToken'" disabled :fileList="rowDataForm.proofUrl" :showUpload="false" uploadTip="”uploadTip“" :limit="2"></picture-upload>
        </el-form-item>
        <el-form-item label="审批意见" prop="remark" :label-width="formLabelWidth">
          <el-input v-model="rowDataForm.remark" type="textarea" style="resize: none" :rows="3" maxlength="100" :disabled="renewalTitle == '续期'" placeholder="请输入内容" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center;" v-if="renewalTitle != '续期'">
        <el-button size="mini" type="primary" @click="auditPass('rowDataForm', 1)">审批通过</el-button>
        <el-button size="mini" type="danger" @click="auditPass('rowDataForm', 2)">审批不通过</el-button>
        <el-button size="mini" @click="show2 = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 短信签名详情 -->
    <el-dialog :title="signatureTitle" :visible.sync="signatureShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="rowDataForm" ref="rowDataForm" class="dialog-form">
        <el-form-item label="企业名称" prop="orgName" :label-width="formLabelWidth">
          <el-input v-model="signatureForm.orgName" autocomplete="off" disabled></el-input>
        </el-form-item>
        <el-form-item label="管理员账号" prop="managerMobile" :label-width="formLabelWidth">
          <el-input v-model="signatureForm.adminName" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="账号类型" prop="managerMobile" :label-width="formLabelWidth">
          <el-input v-model="orgType[signatureForm.orgType]" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="短信签名" prop="signName" :label-width="formLabelWidth">
          <el-input v-model="signatureForm.signName" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="用途" prop="reason" :label-width="formLabelWidth">
          <el-input v-model="signatureForm.reason" type="textarea" style="resize: none" :rows="3" maxlength="100" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="附件" prop="remark" :label-width="formLabelWidth">
          <div v-for="(item, index) in signatureForm.enclosures" :key="index">
            {{ item.enclosureName }}
          </div>
        </el-form-item>
        <el-form-item label="审批意见" prop="remark" :label-width="formLabelWidth">
          <el-input v-model="signatureForm.remark" type="textarea" style="resize: none" :rows="3" maxlength="100" :disabled="renewalTitle == '续期' || !!signatureForm.enableStatus" placeholder="请输入内容" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center;" v-if="signatureForm.type == 1">
        <el-button size="mini" type="primary" @click="signatureApproval(2)">审批通过</el-button>
        <el-button size="mini" type="danger" @click="signatureApproval(3)">审批不通过</el-button>
        <el-button size="mini" @click="signatureShow = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 短信赠送充值详情 -->
    <el-dialog :title="topUpTitle" :visible.sync="topUpShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="rowDataForm" ref="rowDataForm" class="dialog-form" style="padding-bottom: 8px;">
        <el-form-item label="企业名称" prop="orgName" :label-width="formLabelWidth">
          {{ topUpForm.orgName }}
        </el-form-item>
        <el-form-item label="管理员手机号码" prop="managerMobile" :label-width="formLabelWidth">
          {{ topUpForm.managerMobile }}
        </el-form-item>
        <el-form-item label="剩余短信" prop="managerMobile" :label-width="formLabelWidth"> <span>赠送</span>{{ topUpForm.residueGiveNum }}<span>+充值</span>{{ topUpForm.residueRechargeNum }}<span>条</span> </el-form-item>
        <el-form-item label="申请人" prop="signName" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 1">
          <el-input v-model="topUpForm.userName" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="赠送短信" prop="signName" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 1">
          <el-input v-model="topUpForm.num" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="赠送原因" prop="reason" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 1">
          <el-input v-model="signatureForm.reason" type="textarea" style="resize: none" :rows="3" maxlength="100" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="充值金额" prop="signName" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 0">
          <el-input v-model="topUpForm.amount" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="充值短信" prop="signName" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 0">
          <el-input v-model="topUpForm.num" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="充值方式" prop="signName" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 0">
          <el-input v-model="topUpForm.paymentCode" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="充值证明" prop="signName" :label-width="formLabelWidth" v-if="topUpForm.approvalType == 0">
          <div v-for="(item, index) in topUpForm.enclosures" :key="index">
            {{ item.enclosureName }}
          </div>
        </el-form-item>
        <el-form-item label="审批意见" prop="remark" :label-width="formLabelWidth" v-if="(signatureForm.type == 1 && topUpForm.approvalStatus === 0) || topUpForm.approvalStatus !== 0">
          <el-input v-model="topUpForm.remark" type="textarea" style="resize: none" :rows="3" maxlength="100" :disabled="renewalTitle == '续期' || topUpForm.approvalStatus !== 0" placeholder="请输入内容" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" style="text-align: center;" v-if="signatureForm.type == 1">
        <el-button size="mini" type="primary" @click="topUpApprove(1)">审批通过</el-button>
        <el-button size="mini" type="danger" @click="topUpApprove(2)">审批不通过</el-button>
        <el-button size="mini" @click="topUpShow = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 签章弹框 -->
    <el-dialog width="80%" top="5vw" title="合同信息" :visible="signatureDialog" @close="closeSignatureDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="dialog-form">
        <div class="h-10"></div>
        <iframe :src="signatureUrl" height="680px" width="100%" name="demo" scrolling="auto" sandbox="allow-same-origin allow-scripts"></iframe>
      </div>
    </el-dialog>
    <!-- 个人认证验证-->
    <el-dialog :close-on-press-escape="false" class="edit-box" :show-close="false" title="个人认证验证" :visible.sync="personalCertificateShow" width="40%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="close-program">
        <el-button icon="el-icon-close" style="border: none;" @click="closeProgram"></el-button>
      </div>
      <el-form :model="personalForm" ref="personalForm" style="margin-top: 20px">
        <el-form-item label="个人姓名" prop="name" label-width="110px">
          <el-input v-model.trim="personalForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="个人证件类型" prop="certType" label-width="110px">
          <el-select v-model="personalForm.certType" placeholder="请选择" style="width: 100%">
            <el-option label="中国大陆居民身份证" value="CRED_PSN_CH_IDCARD"></el-option>
            <el-option label="香港来往大陆通行证" value="CRED_PSN_CH_HONGKONG"></el-option>
            <el-option label="澳门来往大陆通行证" value="CRED_PSN_CH_MACAO"></el-option>
            <el-option label="台湾来往大陆通行证" value="CRED_PSN_CH_TWCARD"></el-option>
            <el-option label="护照" value="CRED_PSN_PASSPORT"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="个人证件号" prop="certNo" label-width="110px">
          <el-input v-model.trim="personalForm.certNo" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="account" label-width="110px">
          <el-input @keydown.native="keyDown" oninput="if(value.length>11)value=value.slice(0, 11)" type="number" v-model.trim="personalForm.account" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div style="text-align: center;">
        <el-button type="primary" @click="personalCertificate">开始验证</el-button>
      </div>
    </el-dialog>
    <!--企业认证验证-->
    <el-dialog :close-on-press-escape="false" class="edit-box edit-enterprise" title="企业与经办人实名认证" :show-close="false" :visible.sync="enterpriseShow" width="40%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="close-program">
        <el-button icon="el-icon-close" style="border: none;" @click="closeProgram"></el-button>
      </div>
      <el-form :model="enterpriseForm" ref="enterpriseForm">
        <el-form-item label="组织机构名称" prop="name" label-width="140px">
          <el-input size="mini" v-model.trim="enterpriseForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="组织机构证件类型" prop="certType" label-width="140px">
          <el-select size="mini" v-model="enterpriseForm.certType" placeholder="请选择" style="width: 100%">
            <el-option label="统一社会信用代码" value="CRED_ORG_USCC"></el-option>
            <el-option label="工商注册号" value="CRED_ORG_REGCODE"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="组织机构证件号" prop="name" label-width="140px">
          <el-input size="mini" v-model.trim="enterpriseForm.certNo" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="组织机构类型" prop="organizationType" label-width="140px">
          <el-select size="mini" v-model="enterpriseForm.organizationType" placeholder="请选择" style="width: 100%">
            <el-option label="企业类" value="1"></el-option>
            <el-option label="个体工商户" value="2"></el-option>
            <el-option label="其他组织" value="99"></el-option>
          </el-select>
        </el-form-item>
        <el-radio-group v-model="enterpriseFormRadio" size="mini">
          <el-radio-button label="1">法人</el-radio-button>
          <el-radio-button label="2">经办人</el-radio-button>
        </el-radio-group>
        <div style="border: 1px solid #f3f3f3;">
          <el-form-item v-if="enterpriseFormRadio == 1" label="法定代表人姓名" prop="legalRepName" label-width="140px">
            <el-input size="mini" v-model.trim="enterpriseForm.legalRepName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item v-if="enterpriseFormRadio == 1" label="法定代表人证件类型" prop="legalRepCertType" label-width="140px">
            <el-select size="mini" v-model="enterpriseForm.legalRepCertType" placeholder="请选择" style="width: 100%">
              <el-option label="中国大陆居民身份证" value="CRED_PSN_CH_IDCARD"></el-option>
              <el-option label="香港来往大陆通行证" value="CRED_PSN_CH_HONGKONG"></el-option>
              <el-option label="澳门来往大陆通行证" value="CRED_PSN_CH_MACAO"></el-option>
              <el-option label="台湾来往大陆通行证" value="CRED_PSN_CH_TWCARD"></el-option>
              <el-option label="护照" value="CRED_PSN_PASSPORT"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="enterpriseFormRadio == 1" label="法定代表人证件号" prop="legalRepCertNo" label-width="140px">
            <el-input size="mini" v-model.trim="enterpriseForm.legalRepCertNo" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item v-if="enterpriseFormRadio == 1" label="法人手机号码" prop="account" label-width="140px">
            <el-input @keydown.native="keyDown" oninput="if(value.length>11)value=value.slice(0, 11)" type="number" size="mini" v-model.trim="enterpriseForm.account" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item v-if="enterpriseFormRadio == 2" label="经办人姓名" prop="repName" label-width="140px">
            <el-input size="mini" v-model.trim="enterpriseForm.legalRepName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item v-if="enterpriseFormRadio == 2" label="经办人证件类型" prop="legalRepCertType" label-width="140px">
            <el-select size="mini" v-model="enterpriseForm.legalRepCertType" placeholder="请选择" style="width: 100%">
              <el-option label="中国大陆居民身份证" value="CRED_PSN_CH_IDCARD"></el-option>
              <el-option label="香港来往大陆通行证" value="CRED_PSN_CH_HONGKONG"></el-option>
              <el-option label="澳门来往大陆通行证" value="CRED_PSN_CH_MACAO"></el-option>
              <el-option label="台湾来往大陆通行证" value="CRED_PSN_CH_TWCARD"></el-option>
              <el-option label="护照" value="CRED_PSN_PASSPORT"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="enterpriseFormRadio == 2" label="经办人证件号" prop="repCertNo" label-width="140px">
            <el-input size="mini" v-model.trim="enterpriseForm.legalRepCertNo" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item v-if="enterpriseFormRadio == 2" label="经办人手机号码" prop="account" label-width="140px">
            <el-input @keydown.native="keyDown" oninput="if(value.length>11)value=value.slice(0, 11)" type="number" size="mini" v-model.trim="enterpriseForm.account" autocomplete="off"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <div style="text-align: center;">
        <el-button type="primary" @click="personalCertificates">开始验证</el-button>
      </div>
    </el-dialog>

    <!-- 变成二维码弹框 -->
    <el-dialog top="10vh" class="qr-title" width="30%" :visible="authenticationShwo" :title="qrcodeTitle" :close-on-click-modal="true" :close-on-press-escape="false" v-loading="loading" :show-close="false">
      <div class="close-qrcode">
        <el-button icon="el-icon-close" style="border: none;" @click="closeProgram"></el-button>
      </div>
      <p class="hint-tit">请使用系统APP或者微信扫一扫</p>
      <p>{{ hint }}</p>
      <!-- <div v-if="refreshCode"><el-button @click="refreshClick">刷新二维码</el-button></div> -->
      <div ref="qrCode" id="qrCode">
        <div class="codeTime" title="刷新二维码" v-if="refreshCode">
          <i :class="haha ? 'el-icon-refresh-left' : 'el-icon-loading'" @click="refreshClick"></i>
        </div>
        <div class="codeOk" v-if="codeOk">
          <i class="el-icon-circle-check iconColor mb-20"></i>
          <div class="mb-60">扫描成功</div>
          <div>请在手机上根据提示操作</div>
          <el-button type="text" @click="refreshClick">重新加载二维码</el-button>
        </div>
      </div>
    </el-dialog>
    <!-- 查看文章弹框 -->
    <el-dialog :title="infoTitle" width="60%" top="2vw" :visible="infoDialog" @close="closeInfoDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="infoDialog">
        <div class="infoDialog-head">
          <h2>{{ infoDialogType === 3 ? dialogForm2.meetingTitle : dialogForm.noticeTitle }}</h2>
          <div class="sendInfo">
            <span class="mr-20">发布人:{{ infoDialogType === 3 ? dialogForm2.speaker : dialogForm.userName }}</span>
            <span>发布时间:{{ infoDialogType === 3 ? dialogForm2.createTime : dialogForm.sendingTime }}</span>
          </div>
        </div>
        <el-divider></el-divider>
        <div class="sendInfotwo" v-if="infoDialogType === 3">
          <span>会议场所:{{ dialogForm2.meetingPlace }}</span>
          <span>主讲人:{{ dialogForm2.speaker }}</span>
          <span>会议时间:{{ dialogForm2.meetingStartTime + " " + dialogForm2.meetingEndTime }}</span>
        </div>
        <div v-if="infoDialogType === 3">会议简介:</div>
        <!-- <div v-html="infoDialogType === 3 ? dialogForm2.meetingContent : dialogForm.noticeContent" :class="{ dashDiv: infoDialogType === 3 }" class="overDiv"></div> -->
        <myEditorJustLook :pro-html="infoDialogType === 3 ? dialogForm2.meetingContent : dialogForm.noticeContent"></myEditorJustLook>
      </div>
    </el-dialog>
    <!-- 小工具弹框 -->
    <el-dialog width="80%" top="5vw" :title="gadgetTitle" :visible="gadgetDialog" @close="closeGadget" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <!-- <div class="h-10"></div> -->
      <iframe :src="gadgetUrl" height="680px" width="100%" name="demo" scrolling="auto" sandbox="allow-same-origin allow-scripts"></iframe>
    </el-dialog>
    <el-dialog title="常用网站" width="30%" :visible="oftenUrlDialog" @close="closeOftenUrlDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="oftenUrlDialog">
        <div class="addOftenUrl">
          <el-input size="mini" v-model.trim="oftemUrlForm.name" maxlength="25" placeholder="网站名称" style="width:30%"></el-input>
          <el-input size="mini" v-model.trim="oftemUrlForm.url" maxlength="100" placeholder="网址" style="width:55%"></el-input>
          <el-button type="success" icon="el-icon-plus" circle size="mini" @click="addOftenUrl" :disabled="!oftemUrlForm.name || !oftemUrlForm.url"></el-button>
        </div>
        <div class="urlList">
          <div class="urlList-item" :class="{ clickCss: index === urlIndex }" v-for="(item, index) in oftenUrlList" :key="index" @click="openUrl(item, index)">
            <i class="el-icon-close urlDel" @click.stop="deleteWebsite(item.pkId)"></i>
            <div class="urlImg">
              <img :src="item.websiteIcon ? item.websiteIcon : '../assets/oftenurl.png'" alt="" class="imgs" />
            </div>
            <div class="urlName">{{ item.websiteName }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
    <el-dialog title="汇率换算" width="30%" :visible="CNYDialog" @close="closeCNYDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="CNYDialog">
        <el-form label-width="80px">
          <el-form-item label="持有货币">
            <el-select v-model="CNYForm.sourceCurrency" style="width:100%">
              <el-option v-for="item in CNYoptions" :key="item.currencyName" :label="item.currencyDesc + '-' + item.currencyName" :value="item.currencyName"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="目标货币">
            <el-select v-model="CNYForm.targetCurrency" style="width:100%">
              <el-option v-for="item in CNYoptions" :key="item.currencyName" :label="item.currencyDesc + '-' + item.currencyName" :value="item.currencyName"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="兑换金额">
            <div style="display:flex;justify-content: space-between;">
              <el-input v-model="CNYForm.num" style="width:75%"></el-input>
              <el-button type="primary" @click="summryCny">查询计算</el-button>
            </div>
          </el-form-item>
        </el-form>
        <div class="showDiv">
          <div style="color:#9ebcf3">{{ CNYForm.sourName }}兑换{{ CNYForm.targetName }}:</div>
          <div class="caonima">
            <div class="caonimaA">{{ CNYForm.sourNum }}={{ CNYForm.targetNum }}</div>
            <div class="caonimaB">当前汇率：{{ CNYForm.rate }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
    <el-dialog title="天气" :visible="weatherDialog" @close="closeweatherDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="weatherDialog">
        <div class="weather-list">
          <div class="weather-item" v-for="(item, index) in weatherList" :key="index">
            <h4 style="color:#000">星期{{ chineseNum[item.dayOfWeek] }}</h4>
            <div>{{ index === 0 ? "今天" : item.date }}</div>
            <div class="weather-img" :class="`weathericon-${item.weatherIcon}`"></div>
            <div>{{ item.dayWeather }}</div>
            <div>{{ item.nightTemp + "~" + item.dayTemp }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
    <checkDisclosure ref="checkDisclosure" :disclosureDialog.sync="disclosureDialog" @closeLoading="closeLoading" />
  </div>
</template>

<script>
import Echart from "@/components/Echart.vue";
import api from "@/api/api";
import MyDialog from "./settlement/components/MyDialog.vue";
import subDialog from "./settlement/components/subDialog.vue";
import NodeDialog from "@/components/NodeDialog/NodeDialog.vue";
import approvalDialog from "./design/component/approvalDialog.vue";
import approveManageementDialog from "./supplies/components/approveManageementDialog.vue";
import QRCode from "qrcodejs2";
import calendar from "../components/calendar.vue";
import chapterProcess from "@/components/inChapter/chapterProcessApproval.vue";
import pictureUpload from "@/components/pictureUpload";
import checkDisclosure from "./home/compoments/checkDisclosure";
import myEditorJustLook from "@/components/myEditor/myEditorJustLook.vue";
export default {
  components: { Echart, MyDialog, NodeDialog, approvalDialog, subDialog, approveManageementDialog, calendar, chapterProcess, pictureUpload, checkDisclosure, myEditorJustLook },
  data() {
    return {
      sealPersonStatus: 0,
      dept: "",
      radio: 0,
      // 柱形图数据
      option: {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            crossStyle: {
              color: "#999"
            }
          }
        },

        legend: {
          icon: "rect", // 形状  类型包括 circle，rect,line，roundRect，triangle，diamond，pin，arrow，none
          itemWidth: 5, // 设置宽度
          itemHeight: 5, // 设置高度
          itemGap: 34, // 设置间距
          padding: [5, 0, 0, 60],
          data: ["计划产值", "完成产值"],
          textStyle: {
            // 文字样式
            color: "#434d55",
            fontSize: "12",
            width: "300"
          },
          left: "12%",
          top: "9%"
        },
        xAxis: [
          {
            type: "category",
            data: ["2023年5月", "2023年6月", "2023年7月", "2023年8月", "2023年9月", "2023年10月", "2023年11月", "2023年12月", "2024年1月", "2024年2月"],
            axisPointer: {
              type: "shadow"
            }
          }
        ],

        yAxis: [
          {
            type: "value",

            axisLabel: {
              formatter: "{value}"
            },
            nameTextStyle: {
              color: "#5a6771"
              // backgroundColor: '#aed9fe',
              // padding: [10, 30, 0, 15],
            },

            textStyle: {
              border: 1
            }
          }
        ],
        series: [
          {
            name: "计划产值",
            type: "bar",
            barWidth: "17%",
            data: [0, 0, 0, 0]
          },
          {
            name: "完成产值",
            type: "bar",
            barWidth: "17%",
            data: [0, 0, 0, 0]
          }
        ],
        color: ["#3f8dfd", "#1fdaf0"]
      },
      option2: {
        tooltip: {
          trigger: "item"
        },
        title: [
          {
            subtext: "总产值：0",
            left: "23%",
            top: "0%",
            textAlign: "center",
            subtextStyle: {
              textAlign: "center",
              textVerticalAlign: "middle"
            }
          },
          {
            subtext: "当年产值：0",
            left: "53%",
            top: "0%",
            textAlign: "center",
            subtextStyle: {
              textAlign: "center",
              textVerticalAlign: "middle"
            }
          },
          {
            subtext: "当月产值：0",
            left: "83%",
            top: "0%",
            textAlign: "center",
            subtextStyle: {
              textAlign: "center",
              textVerticalAlign: "middle"
            }
          }
        ],
        // legend: {
        //   left: "center",
        //   top: "bottom"
        // },

        normal: {
          color: "#e9eef4"
        },
        // color: ["#3e8cfd", "#20d9ee","#f9913d"],
        color: ["#20d9ee", "#e2e2e2", "#f68f3d", "#e2e2e2", "#e2e2e2", "#f9913d"],
        // #3d8bfd
        // color:['#91cc75','#ee6666'],
        series: [
          {
            name: "累计完成产值",
            type: "pie",
            label: {
              show: false,
              position: "center",
              formatter: "{d}%"
            },
            radius: ["40%", "60%"],
            center: ["23%", "65%"],
            data: [
              // { value: 0, name: "已完成产值", label: { show: true, position: "center", formatter: "{d}%" }, itemStyle: { color: '#3c8afc' } },
              { value: 0, name: "未完成产值", itemStyle: { color: "#eef3fa" } }
            ]
          },
          {
            name: "累计完成产值",
            type: "pie",
            label: {
              show: false,
              position: "center",
              formatter: "{d}%"
            },
            radius: ["40%", "60%"],
            center: ["53%", "65%"],
            data: [
              // { value: 0, name: "已完成产值", label: { show: true, position: "center", formatter: "{d}%" } },
              { value: 0, name: "未完成产值", itemStyle: { color: "#eef3fa" } }
            ]
          },
          {
            name: "当月完成产值",
            type: "pie",
            label: {
              show: false,
              position: "center",
              formatter: "{d}%"
            },
            radius: ["40%", "60%"],
            center: ["83%", "65%"],
            data: [
              // { value: 0, label: { show: true, position: "center", formatter: "{d}%" }, name: "当月完成产值" },
              { value: 0, name: "未完成产值", itemStyle: { color: "#eef3fa" } }
            ]
          }
        ]
      },
      oftenUserDialog: false,
      defaultProps: {
        label: "menuName"
      },
      // 备忘录表
      calendarList: [],
      // 所有路由表
      routes: [],
      // 常用路由表
      oftenUseRoute: [],
      // 项目部
      options: [],
      // 项目信息
      projectInfo: {
        projectName: "",
        investorName: "",
        supervisorName: "",
        contractorName: "",
        projectOrgName: "",
        duration: "",
        beginTime: "",
        endTime: "",
        detailAddress: "",
        remark: ""
      },
      // 待办事项列表，
      todoList: [],
      dialogVisible: false,
      pkId: "",
      disposeMan: [],
      disposeDialog: false,
      roleDtoName: "",
      pkIdItem: "",
      disposeData: {},
      loading: false,
      loading2: false,
      personalForm: {
        authType: "personal",
        name: "", // 个人姓名
        account: "", // 手机号
        certType: "", // 个人认证类型
        certNo: "", // 个人证件号
        distinguishType: "2"
        // redirectUrl: "http://www.baidu.com/"
      },
      personalCertificateShow: false, // 个人认证
      authenticationUrl: "",
      authenticationShwo: false,
      enterpriseShow: false,
      enterpriseForm: {
        authType: "business",
        account: "",
        certNo: "",
        certType: "",
        name: "",
        legalRepCertNo: "",
        legalRepCertType: "",
        legalRepName: "",
        organizationType: "",
        distinguishType: "2",
        legalRepType: ""
      },
      enterpriseFormRadio: "1",
      time: null,
      userFaceDistinguishId: "",
      qrcodeTitle: "实名验证",
      hint: "完成企业或个人实名认证",
      selectShow: false,
      settlementObject: 0,
      designAppData: {},
      approvalDialog: false,
      signatureDialog: false,
      signatureUrl: "",
      refreshData: {},
      refreshCode: false,
      codeOk: false,
      codeTimer: null,
      codeTimer2: null,
      unique: "",
      subDialogVisible: false,
      haha: true, // 控制刷新还是加载二维码
      countdownTime: "",
      stopTime: 0,
      appDialog: false,
      overtime: 0,
      meetList: [],
      newsList: [],
      afficheList: [],
      dialogForm: {
        enableStatus: "",
        noticeAbstract: "",
        noticeContent: "",
        noticeTitle: "",
        noticeType: "",
        publishing: "",
        rotationUrl: "",
        userName: ""
      },
      dialogForm2: {
        meetingContent: "",
        meetingEndTime: "",
        meetingPlace: "",
        meetingStartTime: "",
        speaker: "",
        topic: "",
        userName: ""
      },
      infoDialog: false,
      infoTitle: "文章信息",
      infoDialogType: 1,
      pitchOn: "1",
      gadgetPitch: "",
      informList: [],
      rowDataForm: {},
      formLabelWidth: "110px",
      gadgetDialog: false,
      gadgetUrl: "",
      gadgetTitle: "",
      chaptersApprovalDialog: false,
      bizId: "",
      show2: false,
      renewalTitle: "",
      loading: false,
      fkRenewalId: "",
      signatureShow: false,
      signatureTitle: "",
      signatureForm: {
        orgName: "", // 企业名称
        managerMobile: "", // 管理员账号
        signName: "", // 短信签名
        reason: "", // 用途
        enclosures: [
          // {
          //   enclosureName:"附件名称",
          //   enclosureUrl:"附件路径"
          // }
        ],
        type: 0,
        remark: "",
        pkId: ""
      },
      topUpShow: false,
      topUpTitle: "",
      topUpForm: {
        remark: ""
      },
      orgType: {
        0: "系统运营商",
        1: "系统代理商",
        2: "建设单位(业主方)",
        3: "监理公司",
        4: "施工单位",
        5: "项目部",
        6: "供应商",
        7: "分包单位",
        8: "劳务工人",
        9: "设计院"
      },
      oftenUrlDialog: false,
      oftemUrlForm: {
        name: "",
        url: ""
      },
      urlIndex: "",
      oftenUrlList: [],
      CNYDialog: false,
      CNYoptions: [],
      CNYForm: {
        sourceCurrency: "",
        targetCurrency: "",
        num: "",
        sourName: "",
        sourNum: "",
        targetNum: "",
        targetName: "",
        rate: ""
      },
      weatherDialog: false,
      weatherList: [],
      chineseNum: {
        1: "一",
        2: "二",
        3: "三",
        4: "四",
        5: "五",
        6: "六",
        7: "日"
      },
      todoTime: null,
      defaultImg0: "/static/ali_ceshi0.png",
      defaultImg1: "/static/ali_ceshi1.png",
      defaultImg2: "/static/ali_ceshi2.png",
      xinwen: "/static/xinwen.png",
      gonggao: "/static/gonggao.png",
      huiyi: "/static/huiyi.png",
      disclosureDialog: false,
      newsRedPoint: 0,
      noticeRedPoint: 0,
      notifyRedPoint: 0
    };
  },
  mounted() {
    // console.log('添加后的路由',this.$router.options)
    this.getOftenUseRoute();
    this.getUserInfo();
    this.searchNoticPage(0);
    this.searchNoticPage(1);
    this.searchNoticPage(2);
    this.oaMeetingHomePage();
    this.getNoticeRedPoint();
    this.todoTime = setInterval(() => {
      if (this.$store.state.logDialog) {
        clearInterval(this.todoTime);
        return;
      }
      this.getToDoList();
    }, 1000 * 60);
  },
  beforeDestroy() {
    // 清除定时器
    this.clearCodetime();
    clearInterval(this.todoTime);
  },
  methods: {
    init() {
      this.getToDoList();
      this.$refs.calendar.searchMatterByUserId();
    },

    transTime(time) {
      if (!time) {
        return null;
      }
      const arr = time.split(" ");
      const day = arr[0].split("-");
      return day[0] + "年" + day[1] + "月" + day[2] + "日" + " " + arr[1];
    },
    informClick(type) {
      this.pitchOn = type;
      if (type == 1) {
        this.informList = this.newsList;
      } else if (type == 2) {
        this.informList = this.afficheList;
      } else if (type == 3) {
        this.informList = this.meetList;
        console.log(this.informList);
      }
    },
    gadgetClick(type) {
      this.gadgetPitch = type;
      if (type == 1) {
        this.gadgetTitle = "计算器";
        this.gadgetUrl = "https://www.123cha.com/jsq/";
        // window.open("https://www.123cha.com/jsq/"); 计算器
        this.$nextTick(() => {
          this.gadgetDialog = true;
        });
      } else if (type == 2) {
        this.gadgetTitle = "单位换算";
        this.gadgetUrl = "http://www.columbia.edu/~zz2111/unitexchange.htm";
        // window.open("http://www.columbia.edu/~zz2111/unitexchange.htm"); 单位换算
        // https://tool.lu/unitconverter/#
        this.$nextTick(() => {
          this.gadgetDialog = true;
        });
      } else if (type == 3) {
        // this.gadgetUrl = "https://tool.lu/forex/";
        // window.open("https://tool.lu/forex/");汇率换算
        this.CNYDialog = true;
        this.$api.findCurrencyList().then(res => {
          if (res.code === 200) {
            this.CNYoptions = res.data;
          } else {
            this.$message.warning(res.msg);
          }
        });
      } else if (type == 4) {
        // this.gadgetUrl = "https://www.tianqi.com/15tianqi/";
        // window.open("https://www.tianqi.com/15tianqi/");天气
        this.findCityWeatherForecast();
      } else if (type == 5) {
        this.gadgetTitle = "时钟";
        this.gadgetUrl = "https://time.youdoo.cn/";
        // window.open("https://naozhong.net.cn/shijian/");时钟
        this.$nextTick(() => {
          this.gadgetDialog = true;
        });
      } else if (type == 6) {
        // this.gadgetUrl = "https://www.123cha.com/jsq/";
        // window.open("https://www.123cha.com/jsq/");其他网站
        this.findWebsiteList();
        this.oftenUrlDialog = true;
      }
    },
    closeGadget() {
      this.gadgetUrl = "";
      this.gadgetDialog = false;
    },
    deptChange(e) {
      console.log(this.user.orgType);
      if (this.user.orgType !== 5) {
        this.projectInfo = this.options.length ? this.options.filter(item => item.fkOrgId === this.dept)[0] : {};
        this.findByProjectId();
      } else {
        this.getProInfoById(this.dept);
      }
    },
    // 二维码
    getQrcode() {
      this.$nextTick(res => {
        this.$refs.qrCode.innerHTML = "";
        const location = window.location.origin;
        this.$api.addQRCode().then(res => {
          if (res.code === 200) {
            this.unique = res.data;
            const data = JSON.stringify(encodeURIComponent(this.authenticationUrl));
            new QRCode("qrCode", {
              width: 260,
              height: 260,
              text: `${location}/h5/#/pages/h5/scanCodeTran?type=2&unique=${this.unique}&data=${data}`
            });
            this.queryQRCode();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    timerTask() {
      this.timer = setInterval(() => {
        this.$api
          .userFaceDistinguishState({ pkId: this.userFaceDistinguishId, distinguishType: 0 })
          .then(res => {
            if (res.code == 200) {
              this.stopTime = this.stopTime + 3;
              if (this.stopTime == this.countdownTime) {
                this.stopTime = 0;
                this.countdownTime = "";
                this.refreshCode = true;
                this.codeOk = false;
                return clearInterval(this.timer);
              }
              console.log("xxxxxxxxxxx=====================xxxxxxxxxxxxxxx");
              console.log(this.stopTime);
              console.log(this.countdownTime);
              console.log("xxxxxxxxxxx=====================xxxxxxxxxxxxxxx");
              if (res.data.status == 2) {
                clearInterval(this.timer);
                this.authenticationShwo = false;
                this.personalCertificateShow = false;
                this.enterpriseShow = false;
                this.$message.success("认证成功");
                this.$store.commit("statusAlter", true);
                sessionStorage.setItem("statusAlter", true);
                this.getToDoList();
              }
              if (res.data.status == 3) {
                clearInterval(this.timer);
                this.refreshCode = true;
                this.codeOk = false;
                this.$message({
                  message: res.data.errorInfo,
                  duration: 5000
                });
              }
            } else {
              clearInterval(this.timer);
            }
          })
          .catch(err => {
            clearInterval(this.timer);
          });
      }, 3000);
    },
    getNoticeRedPoint() {
      this.$api.getNoticeRedPoint().then(res => {
        console.log("红点", res.data);
        if (res.code === 200) {
          this.newsRedPoint = res.data.newsRedPoint; //新闻红点 0:无 1:有
          this.noticeRedPoint = res.data.noticeRedPoint; //公告红点 0:无 1:有
          this.notifyRedPoint = res.data.notifyRedPoint; //通知红点 0:无 1:有
        }
      });
    },
    queryQRCode() {
      clearInterval(this.codeTimer);
      this.codeTimer = setInterval(() => {
        this.$api.queryQRCode({ unique: this.unique }).then(res => {
          if (res.code === 200) {
            if (res.data === 1) {
              clearInterval(this.codeTimer);
              this.codeOk = true;
            }
          } else {
            clearInterval(this.codeTimer);
          }
        });
      }, 5000);
      this.codeTimer2 = setTimeout(() => {
        clearInterval(this.codeTimer);
        this.codeOk = true;
      }, 1800000);
    },
    clearCodetime() {
      // 清除定时器
      clearInterval(this.codeTimer);
      this.codeTimer = null;
    },
    refreshClick() {
      this.haha = false;
      const dom = this.$refs.qrCode;
      dom.removeChild(dom.childNodes[3]);
      dom.removeChild(dom.childNodes[3]);
      this.codeOk = false;
      if (this.checkStatus == 1) {
        this.personalCertificates();
      }
      if (this.checkStatus == 2) {
        this.personalCertificate();
      }
      // if (this.checkStatus == 3) {
      //   this.$api.swipingAuthentication().then(res => {
      //     if (res.code == 200) {
      //       this.authenticationUrl = res.data.faceSwipingUrl;
      //       this.userFaceDistinguishId = res.data.userFaceDistinguishId;
      //       this.hint = "完成账号的核身认证";
      //       this.authenticationShwo = true;
      //       this.countdownTime = res.data.countdownTime;
      //       // this.$refs.qrCode.innerHTML = ""
      //       this.getQrcode();
      //       this.timerTask();
      //       this.haha = true;

      //       this.refreshCode = false;
      //     } else {
      //       this.$message.warning("获取核身认证二维码失败");
      //       this.haha = true;
      //       this.refreshCode = true;
      //     }
      //   });
      // }
      if (this.checkStatus == 3) {
        this.$api.authorization().then(res => {
          if (res.code == 200) {
            this.authenticationUrl = res.data.faceSwipingUrl;
            this.userFaceDistinguishId = res.data.userFaceDistinguishId;
            this.hint = "完成账号的授权认证";
            this.authenticationShwo = true;
            this.countdownTime = res.data.countdownTime;
            this.getQrcode();
            this.timerTask();
            this.refreshCode = false;
            this.haha = true;
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    closeProgram() {
      if (this.qrcodeTitle == "授权代办") {
        //
        clearInterval(this.timer);
        clearInterval(this.codeTimer);
        this.qrcodeTitle = "";
        this.authenticationShwo = false;
        this.loading2 = false;
        return;
      }
      this.$confirm("是否退出认证、退出到登录页", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$api.logout().then(res => {
            if (res.code === 200) {
              clearInterval(this.timer);
              this.$router.push("/login");
              localStorage.removeItem("user");
              this.$message.success("退出登录成功");
              this.clearCodetime();
            } else {
              this.$message.warning(res.msg);
            }
          });
        })
        .catch(() => {});
    },
    getUserInfo() {
      api.getPersonInfo().then(res => {
        // debugger
        if (res.code === 200) {
          this.getToDoList();
          this.$store.commit("setUserinfo", res.data);
          this.$store.commit("setBtnPemission", res.data.permissions);
          if (res.data.orgType === 5) {
            this.findByProjectId();
            this.selectShow = false;
            this.dept = res.data.fkOrgId;

            this.getProInfoById(this.dept);
            this.getProjectInfo();
          } else {
            this.selectShow = true;
            this.getAllProject();
          }
          if (res.data.orgType !== 5) {
            this.selectShow = true;
          }
          this.checkStatus = res.data.checkStatus;
          // if (res.data.orgType != 0) {
          // 暂时关闭认证问题方便测试调试
          if (res.data.checkStatus == 0) {
            return;
          }
          // 企业
          // if (res.data.checkStatus == 1) {
          //   return (this.enterpriseShow = true);
          // }
          // 个人
          if (res.data.checkStatus == 2) {
            // this.personalCertificateShow = true;
          }
          if (res.data.checkStatus == 3) {
            // const data = {
            //   authType: "business",
            //   account: res.data.agentAuth.mobile,
            //   certNo: res.data.agentAuth.orgCard,
            //   certType: res.data.agentAuth.certType,
            //   distinguishType: "1",
            //   name: res.data.agentAuth.orgName,
            //   legalRepCertNo: res.data.agentAuth.cardCode,
            //   legalRepCertType: res.data.agentAuth.userCertType,
            //   legalRepName: res.data.agentAuth.realName,
            //   legalRepType: "1",
            //   organizationType: res.data.agentAuth.organizationType
            // };
            this.qrcodeTitle = "授权验证";
            // this.refreshData = data;

            this.$api.authorization({}).then(res => {
              if (res.code == 200) {
                this.authenticationUrl = res.data.faceSwipingUrl;
                this.userFaceDistinguishId = res.data.userFaceDistinguishId;
                this.hint = "完成账号的授权认证";
                this.countdownTime = res.data.countdownTime;
                this.authenticationShwo = true;
                this.getQrcode();
                this.timerTask();
              } else {
                this.$message.warning(res.msg);
              }
            });
          }
          // if (res.data.realNameVerify != 1) {
          //   if (res.data.orgType == 4 || res.data.orgType == 6 || res.data.orgType == 7 || res.data.orgType == 3) {
          //     if (res.data.isMaster == 0) {
          //       this.personalCertificateShow = true;
          //     } else if (res.data.isMaster == 1) {
          //       this.enterpriseShow = true;
          //     }
          //   } else {
          //     this.personalCertificateShow = true;
          //   }
          // } else {
          //   clearInterval(this.timer);
          //   this.authenticationShwo = false;
          //   this.personalCertificateShow = false;
          //   this.enterpriseShow = false;
          // }
          this.overtime = parseInt(res.data.overtime);
          this.overtimeStart();
        }
        // } else {
        //   this.$message.warning(res.msg);
        // }
      });
    },
    overtimeStart() {
      const _this = this;
      const authTimer = setInterval(() => {
        _this.overtime--;
        if (_this.overtime <= 0) {
          _this.getUserInfo();
          clearInterval(authTimer);
        }
      }, 1000);
    },
    personalCertificate() {
      if (this.personalForm.name.length == 0) {
        return this.$message.warning("个人姓名不能为空");
      }
      if (this.personalForm.account.length == 0) {
        return this.$message.warning("手机号码不能为空");
      }
      if (this.personalForm.certType.length == 0) {
        return this.$message.warning("个人认证类型不能为空");
      }
      if (this.personalForm.certNo.length == 0) {
        return this.$message.warning("个人证件号不能为空");
      } else {
        if (this.personalForm.certType == "CRED_PSN_CH_IDCARD") {
          const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
          // 15位身份证号码校验正则
          const regs = /^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$/;
          if (reg.test(this.personalForm.certNo) || regs.test(this.personalForm.certNo)) {
          } else {
            // callback('请输入正确的身份证号码')
            return this.$message.warning("请输入正确的身份证号码");
          }
        }
      }
      this.$api.homeFaceSwiping(this.personalForm).then(res => {
        if (res.code == 200) {
          this.haha = true;
          this.refreshCode = false;
          // this.countdownTime = 30;
          this.countdownTime = res.data.countdownTime;
          this.authenticationUrl = res.data.faceSwipingUrl;
          this.userFaceDistinguishId = res.data.userFaceDistinguishId;
          this.authenticationShwo = true;
          this.getQrcode();
          this.timerTask();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    personalCertificates() {
      if (this.enterpriseForm.name.length == 0) {
        return this.$message.warning("组织机构名称不能为空");
      }
      if (this.enterpriseForm.certType.length == 0) {
        return this.$message.warning("组织机构证件类型不能为空");
      }
      if (this.enterpriseForm.certNo.length == 0) {
        return this.$message.warning("组织机构证件号不能为空");
      }
      if (this.enterpriseForm.organizationType.length == 0) {
        return this.$message.warning("组织机构类型不能为空");
      }
      if (this.enterpriseForm.legalRepName.length == 0) {
        if (this.enterpriseFormRadio == 1) {
          return this.$message.warning("法定代表人姓名不能为空");
        } else {
          return this.$message.warning("经办人姓名不能为空");
        }
      }
      if (this.enterpriseForm.legalRepCertType.length == 0) {
        if (this.enterpriseFormRadio == 1) {
          return this.$message.warning("法定代表人证件类型不能为空");
        } else {
          return this.$message.warning("经办人证件类型不能为空");
        }
      }
      if (this.enterpriseForm.legalRepCertNo.length == 0) {
        if (this.enterpriseFormRadio == 1) {
          return this.$message.warning("法定代表人证件号不能为空");
        } else {
          return this.$message.warning("经办人证件号不能为空");
        }
      } else {
        if (this.enterpriseForm.legalRepCertType == "CRED_PSN_CH_IDCARD") {
          const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
          // 15位身份证号码校验正则
          const regs = /^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$/;
          if (reg.test(this.enterpriseForm.legalRepCertNo) || regs.test(this.enterpriseForm.legalRepCertNo)) {
          } else {
            return this.$message.warning("请输入正确的身份证号码");
          }
        }
      }
      if (this.enterpriseForm.account.length == 0) {
        if (this.enterpriseFormRadio == 1) {
          return this.$message.warning("法人手机号码不能为空");
        } else {
          return this.$message.warning("经办人手机号码不能为空");
        }
      }
      if (this.enterpriseFormRadio == 1) {
        this.enterpriseForm.legalRepType = 0;
      } else {
        this.enterpriseForm.legalRepType = 1;
      }
      this.$api.homeFaceSwiping(this.enterpriseForm).then(res => {
        if (res.code == 200) {
          this.haha = true;
          this.refreshCode = false;
          this.countdownTime = res.data.countdownTime;
          this.authenticationShwo = true;
          this.authenticationUrl = res.data.faceSwipingUrl;
          this.getQrcode();
          this.userFaceDistinguishId = res.data.userFaceDistinguishId;
          this.timerTask();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 禁止输入事件
    keyDown(e) {
      const key = e.key;
      if (key === "e" || key === "-" || key === "." || key == "+") {
        e.returnValue = false;
        return false;
      }
      return true;
    },
    // 测试日历参数
    Test(date, data) {
      // console.log(date, data);
    },
    // 获取待办事项列表
    getToDoList() {
      this.$refs.calendar.searchMatterByUserId();
      const pormise = this.user.orgType != 0 ? api.searchNoAdminBacklogPageList : api.searchBacklogPageList;
      pormise({ pageNum: 1, pageSize: 5 })
        .then(res => {
          // console.log(res);
          if (res.code === 200) {
            if (res.data) {
              this.todoList = res.data.records;
            }
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          clearInterval(this.todoTime);
        });
    },
    handleClick(item) {
      api.searchBacklogPageList({ pageNum: 1, pageSize: 5, beginTime: item, endTime: item }).then(res => {
        // console.log(res);
        if (res.code === 200) {
          if (res.data) {
            this.todoList = res.data.records;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 打开审批弹框
    openApproveDialog(item) {
      this.loading2 = true;
      // 事项类型matterType（1：施工验收流程待办，2：业主计量流程待办，3：分包计价流程待办，4：变更设计流程待办 5:会议签到 6：技术交底 7:盘点流程待办 8:申请用章流程待办,9:收发文待办,10:商务用户续费,11:付费用户续费,12:短信签名申请,13:短信赠送及充值申请,14:合同签署，15：工资结算：16：工资发放 ,17:收发文指定人员待办）
      if (item.matterType === 1) {
        this.lookOver(item.fkBusinessId);
      } else if (item.matterType === 2) {
        this.pkId = item.fkBusinessId;
        this.dialogVisible = true;
      } else if (item.matterType === 3) {
        this.pkId = item.fkBusinessId;
        this.subDialogVisible = true;
      } else if (item.matterType === 4) {
        this.getDesignDetail(item.fkBusinessId);
      } else if (item.matterType === 6) {
        this.$confirm("确定接收该交底？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.$api.updateEnableStatusAndMatter({ pkId: item.pkId }).then(res => {
              this.closeLoading();
              if (res.code === 200) {
                this.$refs.checkDisclosure.selectDisclosureById(item.fkBusinessId);
                this.$message.success("接收成功");
              } else {
                this.$message.warning(res.msg);
              }
            });
          })
          .catch(() => {
            this.loading2 = false;
          });
      } else if (item.matterType === 7) {
        this.$refs.approveManageementDialog.findOrderInventoryById(item.fkBusinessId, 2);
      } else if (item.matterType === 8) {
        this.sealPersonStatus = item.sealPersonStatus;
        this.bizId = item.fkBusinessId;
        this.chaptersApprovalDialog = true;
        this.loading2 = false;
      } else if (item.matterType === 9) {
        this.$confirm("确定接收该发文？", "接收确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.$api.acceptArticle({ pkId: item.pkId }).then(res => {
              this.closeLoading();
              if (res.code === 200) {
                this.init();
                this.$message.success("接收成功");
              } else {
                this.$message.warning(res.msg);
              }
            });
          })
          .catch(err => {
            this.loading2 = false;
          });
      } else if (item.matterType === 10) {
        this.fkRenewalId = item.fkBusinessId;
        this.show2 = true;
        this.renewalTitle = "商务用户-续期";
        this.findRenewalByPkId(item);
        this.loading2 = false;
      } else if (item.matterType === 11) {
        this.fkRenewalId = item.fkBusinessId;
        this.renewalTitle = "付费用户-续期";
        this.show2 = true;
        this.findRenewalByPkId(item);
        this.loading2 = false;
      } else if (item.matterType === 12) {
        this.signature(item);
        this.loading2 = false;
      } else if (item.matterType === 13) {
        this.topUp(item);
        this.loading2 = false;
      } else if (item.matterType === 14) {
        this.rescindById(item);
        this.loading2 = false;
      } else if (item.matterType === 17) {
        this.$confirm("确定接收该发文？", "接收确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.$api.acceptArticleAppoint({ pkId: item.pkId }).then(res => {
              this.closeLoading();
              if (res.code === 200) {
                this.init();
                this.$message.success("接收成功");
              } else {
                this.$message.warning(res.msg);
              }
            });
          })
          .catch(err => {
            this.loading2 = false;
          });
      } else if (item.matterType === 18) {
        console.log("xxxxxx=========xxxxxxxxxxxxxxxxxxxxxx");
        console.log(item);
        console.log("xxxxxx=========xxxxxxxxxxxxxxxxxxxxxx");
        if (this.orgType == 0) {
          this.$api.operationAuthorization().then(res => {
            if (res.code == 200) {
              this.loading2 = false;
              this.authenticationUrl = res.data.faceSwipingUrl;
              this.userFaceDistinguishId = res.data.userFaceDistinguishId;
              this.hint = "完成账号的授权认证";
              this.qrcodeTitle = "授权代办";
              this.authenticationShwo = true;
              this.countdownTime = res.data.countdownTime;
              this.getQrcode();
              this.timerTask();
              this.refreshCode = false;
              this.haha = true;
            } else {
              this.$message.warning(res.msg);
            }
          });
        } else {
          this.$api.authorization().then(res => {
            if (res.code == 200) {
              this.loading2 = false;
              this.authenticationUrl = res.data.faceSwipingUrl;
              this.userFaceDistinguishId = res.data.userFaceDistinguishId;
              this.qrcodeTitle = "授权代办";
              this.hint = "完成账号的授权认证";
              this.authenticationShwo = true;
              this.countdownTime = res.data.countdownTime;
              this.getQrcode();
              this.timerTask();
              this.refreshCode = false;
              this.haha = true;
            } else {
              this.$message.warning(res.msg);
            }
          });
        }
      }

      // console.log("id", pkId, "sourceType", sourceType);
      // if (sourceType === 1) {
      //   this.lookOver(pkId);
      // } else if (sourceType === 2) {
      //   this.pkId = pkId;
      //   this.dialogVisible = true;
      // }
    },
    closeLoading() {
      this.loading2 = false;
    },
    // 获取常用功能菜单
    getOftenUseRoute() {
      api.getOftenRouters().then(res => {
        if (res.code === 200) {
          this.routes = res.data;
          let arr = [];
          res.data.forEach(item => {
            arr = [...arr, ...item.children];
          });
          this.oftenUseRoute = arr.filter(item => item.commonFlag);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 打开设置常用功能弹窗
    openOftenUserDialog() {
      this.getOftenUseRoute();
      this.oftenUserDialog = true;
      this.$nextTick(() => {
        const arr = this.oftenUseRoute.map(item => item.pkId);
        this.$refs.routeTree.setCheckedKeys(arr);
      });
    },
    // 保存常用功能
    saveOftenUseRoute() {
      if (this.$refs.routeTree.getCheckedKeys().length > 10) {
        return this.$message.warning("设置常用功能失败，最多可设置10个常用功能");
      }
      const memuIds = this.$refs.routeTree.getCheckedKeys().join(",");
      this.loading2 = true;
      api
        .setOftenRouters({ memuIds })
        .then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg);
            this.getOftenUseRoute();
            this.oftenUserDialog = false;
          } else {
            this.$message.warning(res.msg);
          }
          this.loading2 = false;
        })
        .catch(err => {
          this.loading2 = false;
        });
    },
    // 获取项目部
    getAllProject() {
      api.getAllProjectInfo2().then(res => {
        if (res.code === 200) {
          if (res.data && res.data.length) {
            this.options = res.data;
            console.log("获取项目部", res.data);
            this.dept = this.options[0].fkOrgId;
            this.deptChange();
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 根据项目ID查询每月完成工程量或产值
    findByProjectId() {
      this.loading2 = true;
      this.projectInfo = this.options.length ? this.options.filter(item => item.fkOrgId === this.dept)[0] : {};
      api
        .getFinishRecordById({ projectId: this.projectInfo.pkId })
        .then(res => {
          console.log("res -----> ", res);
          if (res.code === 200) {
            const nowMonth = new Date().getMonth();
            const arr1 = [];
            const arr2 = [];
            const arr3 = [];
            res.data.monthlyNumber.forEach(item => {
              arr1.push(item.year + "年" + item.month + "月");
              arr2.push(item.designAmount);
              arr3.push(item.finishAmount);
              console.log("arr2 -----> ", arr2);
              console.log("arr3 -----> ", arr3);
            });
            setTimeout(() => {
              this.option = {
                tooltip: {
                  trigger: "axis",
                  axisPointer: {
                    type: "cross",
                    crossStyle: {
                      color: "#999"
                    }
                  }
                },
                legend: {
                  icon: "rect", // 形状  类型包括 circle，rect,line，roundRect，triangle，diamond，pin，arrow，none
                  itemWidth: 5, // 设置宽度
                  itemHeight: 5, // 设置高度
                  itemGap: 34, // 设置间距
                  padding: [5, 0, 0, 60],
                  data: ["计划产值", "完成产值"],
                  textStyle: {
                    color: "#434d55",
                    fontSize: "12",
                    width: "300"
                  },
                  left: "12%",
                  top: "9%"
                },

                xAxis: [
                  {
                    type: "category",
                    data: arr1,
                    axisPointer: {
                      type: "shadow"
                    }
                  }
                ],
                yAxis: [
                  {
                    type: "value",

                    axisLabel: {
                      formatter: "{value}"
                    },
                    nameTextStyle: {
                      color: "#5a6771"
                    },
                    textStyle: {
                      border: 1
                    }
                  }
                ],
                series: [
                  {
                    name: "计划产值",
                    type: "bar",
                    barWidth: "17%",
                    data: arr2
                  },
                  {
                    name: "完成产值",
                    type: "bar",
                    barWidth: "17%",
                    data: arr3
                  }
                ],
                // color: ["3f8dfd", "#1fdaf0"]
                color: ["#3f8dfd", "#1fdaf0"]
              };
              let obj = {
                tooltip: {
                  trigger: "item"
                },
                title: [
                  {
                    subtext: `总产值：${res.data.designAmount}`,
                    left: "23%",
                    top: "-7%",
                    textAlign: "center",
                    subtextStyle: {
                      textAlign: "center",
                      textVerticalAlign: "middle"
                    }
                  },
                  {
                    subtext: `当年产值：${res.data.currentYear}`,
                    left: "53%",
                    top: "-7%",
                    textAlign: "center",
                    subtextStyle: {
                      textAlign: "center",
                      textVerticalAlign: "middle"
                    }
                  },
                  {
                    subtext: `当月产值：${res.data.currentMoon}`,
                    left: "83%",
                    top: "-7%",
                    textAlign: "center",
                    subtextStyle: {
                      textAlign: "center",
                      textVerticalAlign: "middle"
                    }
                  }
                ],

                normal: {
                  color: "#e9eef4"
                },
                // color: ["#3e8cfd", "#20d9ee","#f9913d"],
                color: ["#20d9ee", "#e2e2e2", "#f68f3d", "#e2e2e2", "#e2e2e2", "#f9913d"],
                series: [
                  {
                    name: "总产值",
                    type: "pie",
                    label: {
                      show: false,
                      position: "center",
                      formatter: "{d}%"
                    },
                    radius: ["50%", "70%"],
                    center: ["23%", "55%"],
                    data: [
                      { value: res.data.finishAmount, name: "已完成产值", label: { show: true, position: "center", formatter: "{d}%" }, itemStyle: { color: "#3c8afc" } },
                      { value: res.data.designAmount - res.data.finishAmount, name: "未完成产值", itemStyle: { color: "#eef3fa" } }
                    ]
                  },
                  {
                    name: "当年产值",
                    type: "pie",
                    label: {
                      show: false,
                      position: "center",
                      formatter: "{d}%"
                    },
                    radius: ["50%", "70%"],
                    center: ["53%", "55%"],
                    data: [
                      { value: res.data.finishYear, name: "已完成产值", label: { show: true, position: "center", formatter: "{d}%" } },
                      { value: res.data.currentYear - res.data.finishYear, name: "未完成产值", itemStyle: { color: "#eef3fa" } }
                    ]
                  },
                  {
                    name: "当月完成产值",
                    type: "pie",
                    label: {
                      show: false,
                      position: "center",
                      formatter: "{d}%"
                    },
                    radius: ["50%", "70%"],
                    center: ["83%", "55%"],
                    data: [
                      { value: res.data.finishMoon, label: { show: true, position: "center", formatter: "{d}%" }, name: "当月完成产值", itemStyle: { color: "#f68f3d" } },
                      { value: res.data.currentMoon - res.data.finishMoon, name: "未完成产值", itemStyle: { color: "#eef3fa" } }
                    ]
                  }
                ]
              };
              if (!res.data.finishAmount) {
                obj.series[0].data = obj.series[0].data.filter(item => item.name != "已完成产值");
              }
              if (!res.data.finishYear) {
                obj.series[1].data = obj.series[1].data.filter(item => item.name != "已完成产值");
              }
              if (!res.data.finishMoon) {
                obj.series[2].data = obj.series[2].data.filter(item => item.name != "当月完成产值");
              }
              this.option2 = obj;
            }, 200);
          } else {
            this.$message.warning(res.msg);
          }
          this.loading2 = false;
        })
        .catch(err => {
          this.loading2 = false;
        });
    },
    // 获取当前登陆者所在项目信息
    getProjectInfo() {
      api.getItemList().then(res => {
        if (res.code === 200) {
          if (res.data.length) {
            this.projectInfo = res.data[0];
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 根据id获取项目信息
    getProInfoById(proOrgId) {
      api.findProjectByProOrgId({ proOrgId }).then(res => {
        if (res.code === 200) {
          if (res.data) {
            this.projectInfo = res.data;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取审批节点信息
    lookOver(pkId) {
      this.pkIdItem = pkId;
      this.loading2 = true;
      // 查询流程信息
      this.$api
        .queryProduction({ approveId: pkId, type: 2 })
        .then(res => {
          if (res.code === 200) {
            this.newProcessname = res.data.processName;
            // 处理按钮需要处理传的数据
            this.disposeData = res.data;
            // 处理分项基本信息
            let unitProject = "";
            let partProject = "";
            let outProject = "";
            this.disposeData.reItemApproveDtoList.forEach(item => {
              unitProject = item.unitItemName + "," + unitProject; //单位
              partProject = item.partItemName + "," + partProject; //分部
              outProject = item.itemName + "," + outProject; //完成分项
            });
            this.disposeData.reItemApproveDtoList[0].unitProject = unitProject.slice(0, -1);
            this.disposeData.reItemApproveDtoList[0].partProject = partProject.slice(0, -1);
            this.disposeData.reItemApproveDtoList[0].outProject = outProject.slice(0, -1);
            // 查询负责人,处理必须调用这个接口查
            const itemId = res.data.reItemApproveDtoList[0].fkItemId;
            const orgid = localStorage.getItem("orgId");
            const mobnaid = res.data.prodWorkflowTemplate.pkId;
            const nodeId = res.data.pkId;
            // this.getstaffList(itemId, orgid, mobnaid, nodeId); // 负责人单独接口
            this.disposeDialog = true;
          } else {
            this.$message.warning(res.msg);
          }
          this.loading2 = false;
        })
        .catch(err => {
          this.loading2 = false;
        });
    },
    // 获取负责人
    // getstaffList(itemId, orgId, pkId, nodeId) {
    //   const params = {
    //     itemId,
    //     orgId,
    //     workflowId: pkId,
    //     processId: nodeId
    //   };
    //   this.$api
    //     .getstaffList(params)
    //     .then(res => {
    //       if (res.code == 200 && res.data !== null) {
    //         this.roleDtoName = res.data.roleName;
    //         this.disposeMan = res.data.sysUserList; // 动态传值给处理那边的负责人
    //       }
    //     })
    //     .catch(err => {});
    // },
    cleanData() {
      this.disposeData = {};
      this.pkIdItem = "";
      this.disposeMan = [];
      this.roleDtoName = "";
    },
    // 设计变更审批弹框
    approvalDialogClose() {
      this.approvalDialog = false;
      this.designAppData = {};
    },
    // 根据id查询变更详情
    getDesignDetail(changeId) {
      this.loading2 = true;
      this.$api
        .getDesignDetail({ changeId, type: 2 })
        .then(res => {
          if (res.code === 200) {
            this.designAppData = res.data;
            this.approvalDialog = true;
          } else {
            this.$message.warning(res.msg);
          }
          this.loading2 = false;
        })
        .catch(err => {
          this.loading2 = false;
        });
    },
    // 签章弹框
    rescindById(row) {
      this.$api.contractSign({ pkId: row.fkBusinessId }).then(res => {
        this.closeLoading();
        if (res.code === 200) {
          this.signatureUrl = res.data;
          this.signatureDialog = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeSignatureDialog() {
      this.signatureDialog = false;
      this.getToDoList();
    },
    oaMeetingHomePage() {
      const data = { pageNum: 1, pageSize: 5, readStatus: 0 };
      this.$api.homeMeetingPage(data).then(res => {
        if (res.code === 200) {
          this.meetList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    searchNoticPage(noticeType) {
      const data = { pageNum: 1, pageSize: 5, readStatus: 0, noticeType };
      let api = this.user.orgType != 0 ? this.$api.searchNoticPage2 : this.$api.searchNoticPage3;
      api(data).then(res => {
        if (res.code === 200) {
          if (noticeType === 0) {
            this.newsList = res.data;
            this.informList = this.newsList;
          } else {
            this.afficheList = res.data;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    openInfoDialog(type, row) {
      this.infoDialogType = type - 0;
      if (type == 3) {
        this.oaMeetingfindById(row.pkId);
      } else {
        this.findNoticeById(row.pkId);
      }
    },
    findNoticeById(pkId) {
      this.$api.findNoticeById({ pkId }).then(res => {
        if (res.code === 200) {
          this.infoTitle = "文章信息";
          this.dialogForm = res.data;
          this.infoDialog = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    oaMeetingfindById(pkId) {
      this.$api.oaMeetingfindById({ pkId }).then(res => {
        if (res.code === 200) {
          this.infoTitle = "会议信息";
          this.dialogForm2 = res.data;
          this.infoDialog = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeInfoDialog() {
      if (this.infoDialogType === 1) {
        this.searchNoticPage(0);
      } else if (this.infoDialogType === 2) {
        this.searchNoticPage(1);
      } else if (this.infoDialogType === 3) {
        this.oaMeetingHomePage();
      }
      this.getNoticeRedPoint();
      this.infoDialog = false;
      this.dialogForm = {
        enableStatus: "",
        noticeAbstract: "",
        noticeContent: "",
        noticeTitle: "",
        noticeType: "",
        publishing: "",
        rotationUrl: "",
        userName: ""
      };
      this.dialogForm2 = {
        meetingContent: "",
        meetingEndTime: "",
        meetingPlace: "",
        meetingStartTime: "",
        speaker: "",
        topic: "",
        userName: ""
      };
    },
    topUpApprove(type) {
      const data = {
        approvalReason: this.topUpForm.remark,
        pkId: this.topUpForm.pkId,
        approvalStatus: type
      };
      this.loading2 = true;
      this.$api.sysSmsRechargeApprove(data).then(res => {
        if (res.code == 200) {
          this.topUpShow = false;
          this.loading2 = false;
          this.$message.success("操作成功");
          this.getToDoList();
        } else {
          this.loading2 = false;
          this.$message.warning(res.msg);
        }
      });
    },
    topUp(row) {
      this.signatureForm.type = 1;
      this.$api.sysSmsRechargeFindById({ pkId: row.fkBusinessId }).then(res => {
        if (res.code == 200) {
          this.topUpShow = true;
          this.topUpForm = { ...res.data, remark: res.data.approvalReason ? res.data.approvalReason : "" };
          // this.topUpForm.remark = "";
          if (res.data.approvalType === 0) {
            this.topUpTitle = "短信充值审批";
          } else if (res.data.approvalType == 1) {
            this.topUpTitle = "赠送短信审批";
          }
          this.topUpForm.type = 1;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 查看签名详情
    signatureApproval(type) {
      const data = {
        approvalReason: this.signatureForm.remark,
        pkId: this.signatureForm.pkId,
        approvalStatus: type
      };
      this.loading2 = true;
      this.$api.smsSignApprove(data).then(res => {
        if (res.code == 200) {
          this.signatureShow = false;
          this.loading2 = false;
          this.$message.success("操作成功");
          this.getToDoList();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    findRenewalByPkId(item) {
      const data = {
        pkId: item.fkBusinessId,
        type: item.orgType == 8 ? 1 : 0
      };
      this.$api.findRenewalByPkId(data).then(res => {
        if (res.code == 200) {
          const orgType = {
            0: "系统运营商",
            1: "系统代理商",
            2: "建设单位(业主方)",
            3: "监理公司",
            4: "施工单位",
            5: "项目部",
            6: "供应商",
            7: "分包单位",
            8: "劳务工人",
            9: "设计院"
          };
          res.data.orgTypeName = orgType[res.data.orgType];
          this.rowDataForm = res.data;
          this.rowDataForm.remark = "";
          this.rowDataForm.proofUrl = [this.rowDataForm.proofUrl];
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 续费审核
    auditPass(formName, val) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = {
            remark: this.rowDataForm.remark,
            renewalId: this.fkRenewalId,
            approveStatus: val
          };
          this.loading2 = true;
          this.$api.renewalAuth(data).then(res => {
            if (res.code == 200) {
              this.loading2 = false;
              this.$message({
                type: "success",
                message: res.msg
              });
              this.show2 = false;
              this.getToDoList();
            } else {
              this.loading2 = false;
              this.$message({
                type: "error",
                message: res.msg
              });
            }
          });
        } else {
          return false;
        }
      });
    },
    signature(row) {
      this.signatureForm.remark = "";
      this.signatureTitle = "签名审批";
      this.$api.smsSignFindById({ pkId: row.fkBusinessId }).then(res => {
        if (res.code == 200) {
          this.signatureForm = res.data;
          this.signatureForm.enclosures = res.data.enclosures;
          this.signatureForm.reason = res.data.reason;
          this.signatureForm.pkId = res.data.pkId;
          this.signatureForm.remark = res.data.remark;
          this.signatureForm.orgName = res.data.orgName;
          this.signatureForm.managerMobile = res.data.managerMobile;
          this.signatureForm.signName = res.data.signName;
          this.signatureForm.type = 1;
          this.signatureShow = true;
          delete this.signatureForm.enableStatus;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    findWebsiteList() {
      this.$api.findWebsiteList().then(res => {
        if (res.code === 200) {
          this.oftenUrlList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    openUrl(item, index) {
      this.urlIndex = index;
      let url = item.websiteUrl;
      if (item.websiteUrl.indexOf("https:://") === -1 || item.websiteUrl.indexOf("http:://") === -1) {
        url = "http://" + item.websiteUrl;
      }
      window.open(url, "_blank");
    },
    addOftenUrl() {
      const data = {
        websiteUrl: this.oftemUrlForm.url,
        websiteName: this.oftemUrlForm.name
      };
      this.$api.addWebsite(data).then(res => {
        if (res.code === 200) {
          this.findWebsiteList();
          this.oftemUrlForm = {
            name: "",
            url: ""
          };
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    deleteWebsite(pkId) {
      this.$api.deleteWebsite({ pkId }).then(res => {
        if (res.code === 200) {
          this.findWebsiteList();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeOftenUrlDialog() {
      this.oftenUrlDialog = false;
      this.oftemUrlForm = {
        name: "",
        url: ""
      };
    },
    summryCny() {
      this.CNYForm.sourNum = this.CNYForm.num;
      this.CNYForm.sourName = this.CNYoptions.filter(item => item.currencyName === this.CNYForm.sourceCurrency)[0].currencyDesc;
      this.CNYForm.targetName = this.CNYoptions.filter(item => item.currencyName === this.CNYForm.targetCurrency)[0].currencyDesc;
      const data = {
        sourceCurrency: this.CNYForm.sourceCurrency,
        targetCurrency: this.CNYForm.targetCurrency
      };
      this.$api.findCurrencyExchangeRate(data).then(res => {
        if (res.code === 200) {
          this.CNYForm.rate = res.data.exchangeRate;
          this.CNYForm.targetNum = this.CNYForm.sourNum * res.data.exchangeRate;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeCNYDialog() {
      this.CNYDialog = false;
      this.CNYForm = {
        sourceCurrency: "",
        targetCurrency: "",
        num: "",
        sourName: "",
        sourNum: "",
        targetNum: "",
        targetName: "",
        rate: ""
      };
    },
    findCityWeatherForecast() {
      this.$api.findCityWeatherForecast({ cityName: "" }).then(res => {
        if (res.code === 200) {
          this.weatherList = res.data.forecastList ? res.data.forecastList : [];
          this.weatherDialog = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeweatherDialog() {
      this.weatherDialog = false;
    }
  },
  computed: {
    user() {
      return this.$store.state.user.pkId ? this.$store.state.user : JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  watch: {
    dept(val) {
      if (val) {
      }
    },
    disclosureDialog(val) {
      if (!val) {
        this.init();
      }
    },
    // radio(val) {
    //   this.findByProjectId();
    // },
    authenticationShwo(val) {
      if (val == false) {
        // this.getUserInfo();
        this.clearCodetime();
        clearInterval(this.timer);
        clearInterval(this.codeTimer);
      } else {
        this.personalCertificateShow = false;
        this.enterpriseShow = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
// .app-container {
//   height: 900px;
//   overflow-y: scroll;
// }
li {
  list-style: none;
}
.backlog-title-left {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 10px;
}
.home-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 14px;

  .home-top-item {
    width: 375px;
    height: 190px;
    border: 1px solid #e2e2e2;
    border-radius: 5px;

    .item-header {
      display: flex;
      justify-content: space-between;
      height: 40px;
      line-height: 40px;
      padding: 0 10px;
      color: #fff;
      background-color: #3aa1ff;
      border-radius: 5px;
    }

    .item-main {
      height: 80%;
      overflow: hidden;

      li {
        display: flex;
        justify-content: space-between;
        cursor: pointer;
        height: 30px;
        line-height: 30px;
        padding: 0 10px;

        &:hover {
          color: #3aa1ff;
        }

        .article {
          width: 60%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          letter-spacing: 1px;
        }

        .titleIcon {
          width: 20px;
          height: 20px;
          vertical-align: text-bottom;
          margin-right: 8px;
        }

        .article-time {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }
  }
}

.home-main {
  display: flex;
  // justify-content: space-between;
  width: 1680px;
  height: 450px;

  .home-main-left {
    width: 1070px;
  }

  .home-main-left-top {
    margin-top: 22px;

    .header {
      display: flex;
      justify-content: space-between;
    }

    .main {
      // width: 50%;
      text-align: center;
    }

    .echarts {
      display: flex;
    }
  }

  .home-main-left-bottom {
    display: flex;
    justify-content: space-between;

    .item-information {
      position: relative;
      flex: 3;
      height: 220px;
      border: 1px solid #e2e2e2;
      margin-right: 20px;

      .header {
        height: 30px;
        line-height: 30px;
        padding: 0 10px;

        h1 {
          font-size: 18px;
        }

        h5 {
          font-size: 12px;
        }
      }

      .main {
        display: flex;
        flex-wrap: wrap;
        padding: 0 10px;

        .main-item {
          display: flex;
          align-items: center;
          width: 50%;
          height: 25px;
          line-height: 25px;
          font-size: 14px;

          h5 {
            // width: 50px;
            margin-right: 10px;
          }

          span {
            flex: 1;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
      }

      .footer {
        padding: 0 10px;

        .footer-item {
          display: flex;
          font-size: 14px;
          margin: 8px 0;

          h5 {
            // width: 50px;
            margin-right: 10px;
          }

          span {
            flex: 1;
          }

          .address {
            overflow: hidden;
            /*超出部分隐藏*/
            white-space: nowrap;
            /*禁⽌换⾏*/
            text-overflow: ellipsis;
            /*省略号*/
          }

          .desc {
            display: -webkit-box;
            word-break: break-all;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      }

      h1,
      h5 {
        color: #8c8c8c;
      }
    }

    .gadget {
      position: relative;
      flex: 5;
      height: 220px;
      border: 1px solid #e2e2e2;

      ul {
        display: flex;
        height: 100%;
        justify-content: space-evenly;
        align-items: center;

        li {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;

          a {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            img {
              width: 80px;
            }
          }
        }
      }
    }
  }

  /*}*/
  /*.home-main-right {
    width: 530px;*/

  .often-use-route {
    position: relative;
    width: 100%;
    min-height: 130px;
    border: 1px solid #e2e2e2;
    margin-bottom: 20px;
    margin-top: 22px;
    font-size: 16px;

    .icon {
      display: flex;
      justify-content: flex-end;
      margin-right: 5px;

      .el-icon-setting {
        cursor: pointer;
        font-size: 20px;
      }
    }

    .routers {
      display: flex;
      justify-content: start;
      align-items: center;
      flex-wrap: wrap;

      li {
        padding: 10px 20px;
      }
    }
  }

  .calendar {
    display: flex;
    justify-content: center;
    overflow: auto;
    height: 400px;
  }

  /* } */
}

.dividers {
  position: absolute;
  top: -25px;
  background: #e2e2e2;
}

.el-calendar {
  width: 620px;

  /deep/ .el-calendar__body {
    .el-calendar-table__row {
      /deep/.el-calendar-day {
        text-align: center;
        padding: 0;
        height: none;
      }
    }
  }
}

.dateBar {
  height: 20px;
  background-color: #facdcb;
}

/deep/ .el-tree {
  height: 500px;
  overflow: auto;

  // 不可全选样式
  .el-tree-node {
    .is-leaf + .el-checkbox .el-checkbox__inner {
      display: inline-block;
    }

    .el-checkbox .el-checkbox__inner {
      display: none;
    }
  }
}

.edit-box {
  .close-program {
    position: absolute;
    top: 0;
    right: 0;
  }
}

.edit-enterprise {
  /deep/ .el-form-item {
    margin-bottom: 0;
  }
}

.edit-box-url {
  /deep/ .el-dialog__header {
    padding: 0;
  }

  /deep/ .el-dialog__body {
    padding: 0 !important;
  }
}

.iframe-box {
  height: 800px;
  overflow: hidden !important;
}

/deep/ #app::-webkit-scrollbar {
  display: none !important;

  ::-webkit-scrollbar {
    width: 5px;
    color: #fff;
    background-color: #fcfcfc;
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgb(209, 209, 209);
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

/deep/ #app #appWrapper::-webkit-scrollbar {
  display: none !important;
}

.qr-title {
  text-align: center;

  .close-qrcode {
    position: absolute;
    right: 10px;
    top: 10px;
  }

  .hint-tit {
    padding-top: 20px;
  }

  /deep/ .el-dialog__header {
    background-color: #cfd7da;
    text-align: left;
  }

  #qrCode {
    display: flex;
    justify-content: center;
    padding: 20px 0;
    position: relative;
    height: 300px;

    .codeTime {
      width: 260px;
      height: 260px;
      line-height: 260px;
      font-size: 30px;
      font-weight: 600;
      position: absolute;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      text-align: center;

      i {
        cursor: pointer;
      }
    }
  }

  .el-dialog__body {
    p {
      color: #3aa1ff;
    }
  }
}

.h-10 {
  height: 10px;
}

.infoDialog {
  padding: 20px;
  height: 700px;
  overflow-y: scroll;
  /deep/ .editor {
    height: auto;
  }
  .infoDialog-head {
    text-align: center;

    .sendInfo {
      display: flex;
      justify-content: flex-end;
    }
  }

  .sendInfotwo {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .overDiv {
    height: 550px;
    overflow: auto;
  }
}

.dashDiv {
  border: 1px dashed #dcdfe6;
}

.mr-20 {
  margin-right: 20px;
}

// =========调整后样式
.home-box {
  display: flex;
  height: 61px;

  .mouse:hover {
    cursor: default;
  }

  .title-left {
    display: inline-block;

    border-radius: 1px;
    width: 4px;
    height: 18px;
    opacity: 1;
    border-radius: 2px;
    background: linear-gradient(180deg, rgba(63, 141, 253, 1) 0%, rgba(63, 197, 253, 1) 100%);
    margin: 0 10px;
  }
  .title-left-size {
    font-size: 16px;
    font-weight: 500;
    line-height: 24.7px;
    color: rgba(51, 51, 51, 1);
  }
  .box-left {
    width: 1282px;
    height: 100%;
    padding-right: 10px;

    .inform {
      height: 272px;
      padding: 15px;
      background-color: #fff;
      border-radius: 8px;

      .inform-title {
        display: inline-block;
        width: 100px;
        line-height: 38px;
        cursor: pointer;
        text-align: center;
        border-radius: 8px;
        position: relative;
        span {
          width: 6px;
          height: 6px;
          background-color: red;
          border-radius: 50%;
          position: absolute;
          right: 0;
          top: 0;
        }
      }

      .pitch-on {
        color: #3f8dfd;
        background: #ebf3fe;
      }

      .inform-content {
        margin-top: 15px;
        display: flex;

        .inform-content-item {
          border-radius: 26%;
          width: 398px;
          height: 188px;
          // background-color: red;
          display: inline-block;
          position: relative;
          border-radius: 5px;
          overflow: hidden;

          .item-top {
            cursor: pointer;
            .item-status {
              position: absolute;
              right: 8px;
              top: 8px;
              padding: 3px 3px;
              border-radius: 2px;
              background-color: #e74e50;
              color: #fff;
              font-size: 12px;
              font-weight: 600;
            }
            .btn-status {
              background-color: #999a9e;
            }
          }
          .inform-content-text {
            padding: 10px 0;
            width: 100%;
            position: absolute;
            left: 0px;
            bottom: 0px;
            font-size: 14px;
            color: #fff;
            text-indent: 1em;
            background: rgba(100, 100, 100, 0.5);
          }
          .wu-states {
            width: 100%;
            height: 100%;
            position: relative;
            p {
              position: absolute;
              bottom: 10px;
              left: 50%;
              color: #dddddd;
              font-size: 14px;
              transform: translate(-50%);
            }
          }
        }
      }
    }

    .project-overview {
      width: 100%;
      background-color: #fff;
      padding: 15px;
      margin-top: 10px;
      border-radius: 8px;
      height: 532px;

      .project-overview-title {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #e5e5e5;
        position: relative;
        line-height: 38px;
      }

      .item-information {
        position: relative;
        display: flex;
        margin-top: 20px;

        .item-information-box {
          // width: 50%;
          // height: 144px;
          // border: 1px dashed #e5e5e5;
          // display: flex;

          padding: 5px;
          width: 724px;
          height: 170px;
          opacity: 1;
          border-radius: 4px;

          .information-box-item {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            // height: 150px;

            height: 45px;

            .box-item-title {
              width: 314px;
              display: flex;
              height: 40px;
              font-size: 14px;
              // display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              // background: #f90;
              margin-top: 1px;
              justify-content: flex-start;
              align-items: center;
              margin-left: -11px;
              white-space: nowrap; // 不允许文本换行
              overflow: hidden; // 在文本内容超出容器时隐藏溢出的文本
              text-overflow: ellipsis; // 追加省略号

              .box-item-text {
                display: flex;
                width: 80px;
                height: 20px;
                opacity: 1;
                border-radius: 17px;
                background: linear-gradient(90deg, rgba(96, 173, 240, 1) 0%, rgba(96, 122, 240, 1) 100%);
                color: rgba(255, 255, 255, 1);
                align-items: center;
                line-height: 20px;
                font-size: 12px;
                font-weight: 500;
                padding: 0 15px;
                margin-right: 10px;
              }
              .box-item-content {
                flex: 1;
                white-space: nowrap; // 不允许文本换行
                overflow: hidden; // 在文本内容超出容器时隐藏溢出的文本
                text-overflow: ellipsis; // 追加省略号
              }
            }
          }
        }
      }
    }
  }

  .box-right {
    width: 315px;
    position: relative;
    margin-left: 10px;

    .backlog {
      background: #fff;
      border-radius: 8px;
      margin-top: 10px;
      height: 326px;
      // border-bottom-left-radius: 30px;
      // border-bottom-right-radius: 30px;
      overflow: hidden;

      .backlog-title-box {
        display: flex;
        align-items: center;

        position: relative;
        border-bottom: 1px solid #f2f2f2;
        line-height: 35px;
        margin: 8px;
        padding-top: 5px;
        margin-bottom: 0px;

        .backlog-title-text {
          font-size: 18px;
          font-weight: 500;
          letter-spacing: 0px;
          line-height: 24.7px;
          color: rgba(51, 51, 51, 1);
          text-align: left;
          vertical-align: top;
        }

        .even-more {
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0px;
          line-height: 19.21px;
          color: rgba(170, 170, 170, 1);
          color: #a5a5a5;
          position: absolute;
          right: 0;
          top: 8px;
        }
      }

      .backlog-center-box {
        height: 284px;
        overflow: auto;
        padding: 0 5px;
        background-color: transparent;
        display: flex;
        justify-content: center;

        .backlog-item {
          width: 278px;
          margin-top: 10px;
          position: relative;
          border-radius: 4px;
          background: rgba(255, 255, 255, 1);
          box-shadow: 0px 2px 8px rgba(206, 223, 236, 0.96);
          height: 65px;
          padding: 8px;

          .backlog-item-text {
            width: 250px;
            color: #444242;
            font-size: 15px;
            line-height: 26px;
            white-space: nowrap; // 不允许文本换行
            overflow: hidden; // 在文本内容超出容器时隐藏溢出的文本
            text-overflow: ellipsis; // 追加省略号

            .backlog-item-dot {
              display: inline-block;
              width: 8px;
              height: 8px;
              border-radius: 20px;
              background-color: #3f8dfd;
            }
          }

          .backlog-details {
            display: flex;
            align-items: center;
            height: 22px;
            font-size: 12px;
            color: #8f8f8f;
            // line-height: 19px;
            padding-left: 12px;
            .userName {
              max-width: 72px;
              white-space: nowrap; // 不允许文本换行
              overflow: hidden; // 在文本内容超出容器时隐藏溢出的文本
              text-overflow: ellipsis; // 追加省略号
            }
            .lines {
              margin: 0 6px;
            }
          }

          .backlog-ico {
            position: absolute;
            right: 5px;
            top: 36%;
            color: #8f8f8f;
          }
        }
      }
    }

    .gadget-box {
      margin-top: 10px;
      background: #fff;
      border-radius: 8px;
      padding-bottom: 15px;

      .gadget-box-title {
        display: flex;
        align-items: center;

        position: relative;
        border-bottom: 1px solid #f2f2f2;
        line-height: 40px;
        margin: 8px;
        padding-top: 5px;

        .gadget-box-text {
          font-size: 18px;
          font-weight: 500;
          color: rgba(51, 51, 51, 1);
        }
      }

      .gadget-box-item {
        border-radius: 4px;
        width: 66px;
        height: 66px;
        // background-color: #dcf8ff;
        margin: 0 auto;
        // border: 1px dashed #9accff;
        font-size: 12px;

        .img-box {
          width: 40px;
          height: 40px;
          margin: 0 auto;
          border-radius: 50%;
          margin-top: 5px;
          margin-bottom: 3px;

          .gadget-img {
            width: 20px;
            height: 20px;
            margin-left: 10px;
            margin-top: 9px;
          }
        }

        .item-text {
          text-align: center;
          color: #3b565e;
          font-size: 13px;
        }
      }

      .gadget-pitch {
        background-color: #dbf8ff;
        border: 1px dashed #638fff;
      }
    }
  }
}

.oftenUrlDialog {
  padding: 20px;

  .addOftenUrl {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    margin-bottom: 20px;
  }

  .urlList {
    display: flex;
    // justify-content: space-evenly;
    flex-wrap: wrap;
    height: 300px;
    overflow: auto;

    .urlList-item {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      width: 25%;
      height: 130px;
      cursor: pointer;

      .urlDel {
        position: absolute;
        top: 3px;
        right: 5px;
        font-size: 20px;
        color: #5f6368;
        z-index: 5;
        cursor: pointer;
      }

      .urlImg {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: #e5e7e8;
        margin-bottom: 10px;
      }

      .imgs {
        width: 45px;
        height: 45px;
        // border-radius: 50%;
        // background-color: #fff;
      }
    }

    .clickCss {
      background-color: #f2f2f2;
    }
  }
}

.CNYDialog {
  padding: 20px;

  .showDiv {
    margin-top: 20px;
    border-top: 1px dotted #1515ff;
    font-size: 18px;
  }

  .caonima {
    border: 1px solid #9ebcf3;

    .caonimaA {
      display: flex;
      justify-content: center;
      align-items: center;
      border-bottom: 1px solid #000;
      height: 60px;
      font-weight: 700;
    }

    .caonimaB {
      display: flex;
      justify-content: center;
      align-items: center;
      color: #9ebcf3;
      height: 40px;
    }
  }
}

.weatherDialog {
  height: 300px;

  .weather-list {
    display: flex;
    flex-wrap: wrap;
  }

  .weather-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 25%;
    height: 300px;
    border-right: 1px dotted #d9d9d9;
    border-bottom: 1px dotted #d9d9d9;
    text-align: center;
    color: #bcbcbc;

    &:nth-child(n > 5) {
      border-bottom: none;
    }

    &:nth-child(5n) {
      border-right: none;
    }
  }

  .weather-img {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: url("../assets/weather.png") no-repeat;
    background-size: 650px 661px;
  }

  .weathericon-100 {
    background-position: 0 0;
  }

  .weathericon-101 {
    background-position: -168px 0;
  }

  .weathericon-102 {
    background-position: -336px 0;
  }

  .weathericon-103 {
    background-position: -504px 0;
  }

  .weathericon-104 {
    background-position: 0 -173px;
  }

  .weathericon-105 {
    background-position: -168px -170px;
  }

  .weathericon-106 {
    background-position: -336px -170px;
  }

  .weathericon-107 {
    background-position: -168px -340px;
  }

  .weathericon-108 {
    background-position: -336px -340px;
  }

  .weathericon-109 {
    background-position: -504px -510px;
  }
}

.codeOk {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #fff;
  z-index: 1;

  .iconColor {
    color: #6bc839;
    font-size: 40px;
  }

  .mb-20 {
    margin-bottom: 20px;
  }

  .mb-60 {
    margin-bottom: 60px;
  }
}
.echartsClass-1 {
  position: relative;
}
.echartsClass {
  margin-top: 2px;
}
.FinishedOutput-wan {
  position: absolute;
  left: 350px;
  top: -3px;
  font-size: 12px;
  font-weight: 400;
  color: rgba(170, 170, 170, 1);
  z-index: 99;
}

/deep/ .FinishedOutput {
  position: relative;
  bottom: -20px;
  right: -12px;
  padding-left: 10px;
  display: flex;
  align-items: center;
  font-size: 12px;
  // background: linear-gradient(45deg, #aed9fe, rgba(63, 141, 253, 0));

  line-height: 35px;
  /** 文本1 */
  font-weight: 400;
  // border: 1px dashed #89c8ff;
  margin-left: -15px;
  padding: 0 5px;
}

/deep/ .el-select .el-input__inner {
  background-color: #f5f9fcff;
}
</style>
