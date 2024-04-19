<!-- 短信运维-->
<template>
    <div class="app-container">
        <div class="short-message">
            <div class="message-item">
                <div class="item-label"> 系统短信剩余条数：<span style="color:#1890ff;"><span class="num" style="font-size: 24px;">{{
                    noteLog.residueSum }}</span> 条 </span></div>
                <!-- <div class="item-label" style="color:  #ecf5ff;"><span class="num">0</span></div> -->
                <div class="item-label">企业累计消耗条数： <span style="color:#1890ff;"><span class="num">{{ noteLog.consumeSum
                }}</span> 条</span></div>
                <div class="item-label"> 企业短信剩余条数：<span style="color:#1890ff;"><span class="num">{{ noteLog.orgResidueSum
                }}</span> 条 (赠送{{ noteLog.giveSum }}+充值 {{ noteLog.rechargeSum }}) </span></div>
            </div>
            <div class="message-item">
                <div class="item-label" style="color:  #ecf5ff;"><span class="num">0</span></div>
                <div class="item-label">上月企业消耗条数： <span style="color:#1890ff;"><span class="num">{{ noteLog.lastMonthConsume
                }}</span> 条</span></div>
                <div class="item-label"> 本月企业已用条数：<span style="color:#1890ff;"><span class="num">{{ noteLog.thisMonthConsume
                }}</span> 条 </span></div>
            </div>
            <!-- <div class="message-item">
         
            </div> -->
            <div class="message-btn">
                <div><el-button size="mini" type="primary"  class="el-button-primary" v-has="'maintain:sms:insufficientSetting'"
                        @click="earlyWarning(0)">短信不足预警设置</el-button></div>
                <div style="margin-top: 20px;"><el-button size="mini" class="el-button-primary"  type="primary" v-has="'maintain:sms:fastConsumption'"
                        @click="earlyWarning(1)">短信消费过快预警设置</el-button></div>
            </div>
        </div>
        <el-tabs v-model="orgType" @tab-click="orgTypeChange" style="margin-top: 10px;">
            <el-tab-pane label="短信管理" name="0"></el-tab-pane>
            <el-tab-pane label="短信记录" name="1"></el-tab-pane>
        </el-tabs>
        <div class="header-seach search-bar-box">
            <el-form :inline="true" class="myform" label-width="72px">
                <el-form-item label="企业类型" v-if="orgType == 0">
                    <el-select v-model="inpData.orgType" size="mini" class="wh-140">
                        <el-option value="" label="全部"></el-option>
                        <el-option v-for="item in typeOptions" :key="item.value" :value="item.value"
                            :label="item.label"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="企业名称" v-if="orgType == 0">
                    <el-input size="mini" v-model="inpData.orgName"  maxlength="50"></el-input>
                </el-form-item>
                <el-form-item label="选择企业" v-if="orgType == 1">
                    <el-select v-model="inpData.orgType" size="mini" class="wh-140">
                        <el-option value="" label="全部"></el-option>
                        <el-option v-for="item in typeOptions" :key="item.value" :value="item.value"
                            :label="item.label"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="状态" v-if="orgType == 1">
                    <el-select v-model="inpData.smsStatus" size="mini" class="wh-140">
                        <el-option value="" label="全部"></el-option>
                        <el-option value="0" label="发送中"></el-option>
                        <el-option value="1" label="发送成功"></el-option>
                        <el-option value="2" label="发送失败"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="发送日期" v-if="orgType == 1">
                    <el-date-picker size="mini" :picker-options="pickerOptionsAnd" class="wh-140" value-format="yyyy-MM-dd"
                        v-model="inpData.beginTime"></el-date-picker>
                    <span>至</span>
                    <el-date-picker size="mini" :picker-options="pickerOptionsEnd" class="wh-140" value-format="yyyy-MM-dd"
                        v-model="inpData.endTime"></el-date-picker>
                </el-form-item>
                <el-form-item label="接收人" v-if="orgType == 1">
                    <el-input size="mini" v-model="inpData.receiveName"  maxlength="25"></el-input>
                </el-form-item>
                <el-form-item label="接收手机号码" label-width="110px" v-if="orgType == 1">
                    <el-input size="mini" v-model="inpData.receivePhone" type="number"
                        oninput="if(value.length>11)value=value.slice(0, 11)" maxlength="11"
                        @keydown.native="keyDown"></el-input>
                </el-form-item>
                <el-button size="mini" icon="el-icon-search" type="primary" class="ml-20 search el-button-primary"
                    @click="btnSearch">查询</el-button>
            </el-form>
        </div>
        <div class="table-data" style="height:50%;margin-top: 10px;">
            <el-table :tooltip-effect="'light'" stripe v-if="orgType == 0" height="100%" ref="tables" :data="tableData"
                :header-cell-style="{ background: '#f1f6ff' }">
                <el-table-column label="序号" align="center" width="60">
                    <template slot-scope="scope">
                        <div style="text-align: center">
                            {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="企业名称" align="center" prop="orgName" min-width="80"> </el-table-column>
                <el-table-column label="管理员手机号码" align="center" prop="managerMobile" min-width="110" show-overflow-tooltip></el-table-column>
                <el-table-column label="赠送剩余短信" align="center" prop="giveResidueNum" min-width="100" show-overflow-tooltip> </el-table-column>
                <el-table-column label="充值剩余短信" align="center" prop="rechargeResidueNum" min-width="110" show-overflow-tooltip></el-table-column>
                <el-table-column label="剩余短信合计" align="center" prop="num" min-width="90" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                        {{ row.giveResidueNum + row.rechargeResidueNum }}
                    </template>
                </el-table-column>
                <el-table-column label="最近充值日期" align="center" prop="lastRechargeDate" min-width="150" show-overflow-tooltip></el-table-column>
                <el-table-column label="近一个月使用量" align="center" prop="monthUseNum" show-overflow-tooltip> </el-table-column>
                <el-table-column label="操作" align="center" prop="smsStatus" min-width="360px">
                    <template slot-scope="{ row }">

                        <el-button type="success" plain v-has="'maintain:sms:give'" size="mini"
                            @click="giveAway(row)">赠送</el-button>
                        <el-button type="success" plain v-has="'maintain:sms:recharge'" size="mini"
                            @click="topUp(row)">充值</el-button>
                        <el-button type="primary" plain v-has="'maintain:sms:giveQuery'" size="mini"
                            @click="examine(row, 0)">查看赠送记录</el-button>
                        <el-button type="primary" plain v-has="'maintain:sms:rechargeQuery'" size="mini"
                            @click="examine(row, 1)">查看充值记录</el-button>
                        <el-button type="primary" plain v-has="'maintain:sms:sendQuery'" size="mini"
                            @click="sendDit(row)">查看发送记录</el-button>
                        <!-- <el-button type="danger" v-if="row.approvalStatus != 1" @click="delBtn(row)" size="mini">删除</el-button> -->
                    </template>
                </el-table-column>
                <div slot="empty" class="empty" style="width: 100%">
                    <img src="@/assets/empty.svg" class="zanwu" />
                    <span>暂无数据</span>
                </div>
            </el-table>
            <el-table :tooltip-effect="'light'" stripe v-if="orgType == 1" height="100%" ref="tables" :data="tableData"
                :header-cell-style="{ background: '#f1f6ff' }">
                <el-table-column label="序号" align="center" width="60">
                    <template slot-scope="scope">
                        <div style="text-align: center">
                            {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="企业名称" align="center" prop="orgName" min-width="80"> </el-table-column>
                <el-table-column label="接收人" align="center" prop="receiveName" min-width="80" show-overflow-tooltip></el-table-column>
                <el-table-column label="接收手机号码" align="center" prop="receivePhone" min-width="100" show-overflow-tooltip> </el-table-column>
                <el-table-column label="发送内容" align="center" prop="smsContent" min-width="140" show-overflow-tooltip></el-table-column>
                <el-table-column label="短信条数" align="center" prop="smsNumber" min-width="80" show-overflow-tooltip></el-table-column>
                <el-table-column label="发送人" align="center" prop="sender" min-width="80" show-overflow-tooltip></el-table-column>
                <el-table-column label="发送时间" align="center" prop="createTime" min-width="80" show-overflow-tooltip> </el-table-column>
                <el-table-column label="状态" align="center" prop="smsStatus" min-width="80">
                    <template slot-scope="{ row }">
                        <span v-if="row.smsStatus == 0">发送中</span>
                        <span v-if="row.smsStatus == 1" class="succeed">发送成功</span>
                        <span v-if="row.smsStatus == 2" class="failure">发送失败</span>
                    </template>
                </el-table-column>
                <div slot="empty" class="empty" style="width: 100%">
                    <img src="@/assets/empty.svg" class="zanwu" />
                    <span>暂无数据</span>
                </div>
            </el-table>
        </div>
        <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum"
            @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></tablePaging>
        <el-dialog :title="approvalType == 1 ? '赠送短信' : '短信充值'" width="500px" :visible.sync="show1" v-dialogDrag
            :close-on-click-modal="false" @click="callOff(false)" :close-on-press-escape="false" v-loading="loading">
            <el-form :model="form" ref="form" class="dialog-form">
                <el-form-item label="企业名称" prop="templateName" :label-width="formLabelWidth">
                    {{ form.orgName }}
                </el-form-item>
                <el-form-item label="管理员手机号码" prop="templateContent" :label-width="formLabelWidth">
                    {{ form.managerMobile }}
                </el-form-item>
                <el-form-item label="剩余短信" prop="templateContent" :label-width="formLabelWidth">
                    赠送{{ form.giveResidueNum }}+充值{{ form.rechargeResidueNum }}条
                </el-form-item>
                <el-form-item label="赠送短信" prop="templateContent" :label-width="formLabelWidth" v-if="approvalType == 1">
                    <el-input size="mini" class="wh-200" @input="form.num = $limitInputNumber($event,1000000,0)" :disabled="showStatus"
                        v-model="form.num"></el-input>条
                </el-form-item>
                <el-form-item label="赠送原因" prop="templateContent" :label-width="formLabelWidth" v-if="approvalType == 1">
                    <el-input v-model="form.reason" type="textarea" style="resize: none" :rows="8" maxlength="100"
                        :disabled="showStatus" placeholder="请输入内容" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="充值金额" prop="templateContent" :label-width="formLabelWidth" v-if="approvalType == 0">
                    <el-input size="mini" class="wh-200" type="number" @keydown.native="keyDown" :disabled="showStatus"
                        v-model="form.amount"></el-input>元
                </el-form-item>
                <el-form-item label="充值短信" prop="templateContent" :label-width="formLabelWidth" v-if="approvalType == 0">
                    <el-input size="mini" class="wh-200" @input="form.num = $limitInputNumber($event,1000000,0)" :disabled="showStatus"
                        v-model="form.num"></el-input>条
                </el-form-item>
                <el-form-item label="充值方式" prop="templateContent" :label-width="formLabelWidth" v-if="approvalType == 0">
                    <el-select v-model="form.paymentCode" size="mini" class="wh-200" :disabled="showStatus">
                        <el-option v-for="item in paymentData" :key="item.keyName" :value="item.keyName"
                            :label="item.keyVal"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="充值证明" prop="templateContent" :label-width="formLabelWidth" v-if="approvalType == 0">
                    <div v-if="!showStatus">
                        <p class="fileT" ref="dsafds" @click="empty" v-show="(bookUrl == '' || bookUrl == null)">
                            <input accept=".jpeg,.jpg,.png" type="file" ref="file" id="upload" @change="upLoad" />
                        </p>
                        <p v-show="bookUrl != '' && bookUrl != null">
                            <span>{{ accessoryName }}</span>
                            <span><i class="el-icon-close" style="color: red" @click="empty"></i></span>
                        </p>
                        <el-input v-model="bookUrl" autocomplete="off" v-show="false"></el-input>
                    </div>
                    <div v-else>
                        <!-- <img :src="showUrl" alt="" v-if="showUrl.length!=0" width="50" height="60"> -->
                        <el-image style="width: 100px; height: 100px" :src="showUrl" :preview-src-list="srcList"></el-image>
                    </div>
                </el-form-item>
            </el-form>
            <div style="height: 10px;" v-if="showStatus"></div>
            <div slot="footer" class="dialog-footer" v-if="!showStatus">
                <el-button size="mini" @click="callOff(false)">取 消</el-button>
                <el-button size="mini" type="primary" class="el-button-primary" @click="submit">提交审批</el-button>
            </div>
        </el-dialog>
        <!-- 预警 -->
        <el-dialog :title="warningTitle" width="500px" :visible.sync="show2" v-dialogDrag :close-on-click-modal="false"
            :close-on-press-escape="false" v-loading="loading">
            <el-form :model="warningData" ref="form" class="dialog-form">
                <el-form-item label="" prop="templateName" label-width="0px">
                    <el-select v-model="warningData.enableStatus" size="mini" class="wh-140">
                        <el-option :value="0" label="不启用预警"></el-option>
                        <el-option :value="1" label="启用预警"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="系统短信剩余不足" prop="templateContent" label-width="130px"
                    v-if="warningData.enableStatus == 1 && alarmType == 0">
                    <el-input size="mini" style="width: 120px;" v-model="warningData.firstCondition"></el-input>条进行短信通知预警
                </el-form-item>
                <el-form-item label="系统短信5分钟内消耗" prop="templateContent" label-width="160px"
                    v-if="warningData.enableStatus == 1 && alarmType == 1">
                    <el-input size="mini" style="width: 100px;" type="number" @keydown.native="keyDown"
                        v-model="warningData.firstCondition"></el-input>条进行短信通知预警
                </el-form-item>
                <el-form-item label="预警通知手机号码" prop="templateContent" label-width="130px"
                    v-if="warningData.enableStatus == 1">
                    <el-input size="mini" style="width: 150px;" v-model="warningData.alarmTelephone" type="number"
                        oninput="if(value.length>11)value=value.slice(0, 11)" maxlength="11" @blur="alarmTelephoneBlur"
                        @keydown.native="keyDown"></el-input>
                </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="mini" @click="cancel">取 消</el-button>
                <el-button size="mini" type="primary" class="el-button-primary" @click="ensure">保 存</el-button>
            </div>
        </el-dialog>
        <!-- 赠送充值记录 -->
        <el-dialog :title="detailTitle" v-loading="loading" width="80%" :visible.sync="show3" v-dialogDrag
            :close-on-click-modal="false" :close-on-press-escape="false">
            <div class="header-seach">
                <el-form :inline="true" class="myform" label-width="72px">
                    <el-form-item label="状态" label-width="40px">
                        <el-select v-model="detailForm.approvalStatus" size="mini" class="wh-140">
                            <el-option value="" label="全部"></el-option>
                            <el-option value="0" label="待审批"></el-option>
                            <el-option value="1" label="审批通过"></el-option>
                            <el-option value="2" label="审批不通过"></el-option>
                            <el-option value="3" label="自动通过审批"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="detailType == 0 ? '赠送日期' : '充值日期'">
                        <el-date-picker size="mini" :picker-options="pickerDetailFormAnd" class="wh-140"
                            value-format="yyyy-MM-dd" v-model="detailForm.beginTime"></el-date-picker>
                        <span>至</span>
                        <el-date-picker size="mini" :picker-options="pickerDetailFormEnd" class="wh-140"
                            value-format="yyyy-MM-dd" v-model="detailForm.endTime"></el-date-picker>
                    </el-form-item>
                    <el-form-item :label="detailType == 0 ? '赠送人' : '录入人'">
                        <el-input size="mini" v-model="detailForm.userName"></el-input>
                    </el-form-item>
                    <el-button size="mini" type="primary" class="ml-20 search el-button-primary" @click="detailSearch">查询</el-button>
                </el-form>
            </div>
            <el-table :tooltip-effect="'light'" stripe height="500px" ref="detailTable" :data="detailData"
                :header-cell-style="{ background: '#f1f6ff' }">
                <el-table-column label="序号" align="center" width="60">
                    <template slot-scope="scope">
                        <div style="text-align: center">
                            {{ (detailForm.pageNum - 1) * detailForm.pageSize + (scope.$index + 1) }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column :label="detailType == 0 ? '赠送人' : '录入人'" align="center" prop="userName" min-width="100">
                </el-table-column>
                <el-table-column :label="detailType == 0 ? '赠送量' : '充值量'" align="center" prop="num"
                    min-width="110"></el-table-column>
                <el-table-column label="赠送原因" v-if="detailType == 0" align="reason" prop="reason" show-overflow-tooltip> </el-table-column>
                <el-table-column label="充值证明" v-if="detailType == 1" align="center" prop="createUser" min-width="100" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                        <span v-if="row.enclosures != null">{{ row.enclosures[0].enclosureName }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="充值方式" v-if="detailType == 1" align="center" prop="paymentCode"
                    min-width="100" show-overflow-tooltip></el-table-column>
                <el-table-column :label="detailType == 0 ? '赠送时间' : '充值时间'" align="center" prop="createTime"
                    min-width="100" show-overflow-tooltip>
                </el-table-column>
                <el-table-column label="审批人" align="center" prop="approveName" min-width="100" show-overflow-tooltip> </el-table-column>
                <el-table-column label="审批时间" align="center" prop="approveTime" min-width="150" show-overflow-tooltip> </el-table-column>
                <el-table-column label="审批状态" align="center" prop="smsStatus" min-width="100" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                        <span v-if="row.approvalStatus == 0">待审批</span>
                        <span v-if="row.approvalStatus == 1" class="succeed">审批成功</span>
                        <span v-if="row.approvalStatus == 2" class="failure">审批不通过</span>
                        <span v-if="row.approvalStatus == 3">自动通过处理</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" prop="smsStatus" min-width="100">
                    <template slot-scope="{ row }">
                        <el-button type="primary"  plain size="mini" @click="quickLook(row)">查看</el-button>
                        <el-button type="danger" v-if="row.approvalStatus == 0" plain size="mini"
                            @click="withdraw(row)">撤回</el-button>
                    </template>
                </el-table-column>
                <div slot="empty" class="empty" style="width: 100%">
                    <img src="@/assets/empty.svg" class="zanwu" />
                    <span>暂无数据</span>
                </div>
            </el-table>
            <tablePaging :pageSize="detailForm.pageSize" :total="detailTotal" :currentPage="detailForm.pageNum"
                @handleSizeChange="detailSizeChange" @handleCurrentChange="detailCurrentChange"></tablePaging>
        </el-dialog>
        <!-- 发送记录 -->
        <el-dialog :title="recordTitle" v-loading="loading" width="80%" :visible.sync="show4" v-dialogDrag
            :close-on-click-modal="false" :close-on-press-escape="false">
            <div class="header-seach">
                <el-form :inline="true" class="myform" label-width="72px">
                    <el-form-item label="状态" label-width="40px">
                        <el-select v-model="recordForm.smsStatus" size="mini" class="wh-140">
                            <el-option value="" label="全部"></el-option>
                            <el-option value="0" label="发送中"></el-option>
                            <el-option value="1" label="发送成功"></el-option>
                            <el-option value="2" label="发送失败"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="发送日期">
                        <el-date-picker size="mini" :picker-options="pickerRecordFormAnd" class="wh-140"
                            value-format="yyyy-MM-dd" v-model="recordForm.beginTime"></el-date-picker>
                        <span>至</span>
                        <el-date-picker size="mini" :picker-options="pickerRecordFormEnd" class="wh-140"
                            value-format="yyyy-MM-dd" v-model="recordForm.endTime"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="接收人">
                        <el-input size="mini" v-model="recordForm.receiveName"></el-input>
                    </el-form-item>
                    <el-form-item label="接收手机号码" label-width="110px">
                        <el-input size="mini" v-model="recordForm.receivePhone" type="number"
                            oninput="if(value.length>11)value=value.slice(0, 11)" maxlength="11"
                            @keydown.native="keyDown"></el-input>
                    </el-form-item>
                    <el-button size="mini" type="primary" class="ml-20 search el-button-primary" @click="recordSearch">查询</el-button>
                </el-form>
            </div>
            <el-table :tooltip-effect="'light'" stripe height="500px" ref="recordTable" :data="recordData"
                :header-cell-style="{ background: '#f1f6ff' }">
                <el-table-column label="序号" align="center" width="60">
                    <template slot-scope="scope">
                        <div style="text-align: center">
                            {{ (recordForm.pageNum - 1) * recordForm.pageSize + (scope.$index + 1) }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="接收人" align="center" prop="receiveName" min-width="100"></el-table-column>
                <el-table-column label="接收手机号码" align="center" prop="receivePhone" min-width="110" show-overflow-tooltip></el-table-column>
                <el-table-column label="发送内容" prop="smsContent" show-overflow-tooltip> </el-table-column>
                <el-table-column label="短信条数" align="center" prop="smsNumber" min-width="100" show-overflow-tooltip> </el-table-column>
                <el-table-column label="发送人" align="center" prop="sender" min-width="80" show-overflow-tooltip> </el-table-column>
                <el-table-column label="发送时间" align="center" prop="createTime" min-width="100" show-overflow-tooltip> </el-table-column>
                <el-table-column label="状态" align="center" prop="smsStatus" min-width="100">
                    <template slot-scope="{ row }">
                        <span v-if="row.smsStatus == 0">发送中</span>
                        <span v-if="row.smsStatus == 1" class="succeed">发送成功</span>
                        <span v-if="row.smsStatus == 2" class="failure">发送失败</span>>
                    </template>
                </el-table-column>
                <div slot="empty" class="empty" style="width: 100%">
                    <img src="@/assets/empty.svg" class="zanwu" />
                    <span>暂无数据</span>
                </div>
            </el-table>
            <tablePaging :pageSize="recordForm.pageSize" :total="recordTotal" :currentPage="recordForm.pageNum"
                @handleSizeChange="recordSizeChange" @handleCurrentChange="recordCurrentChange"></tablePaging>
        </el-dialog>
    </div>
</template>
<script>
import COS from "cos-js-sdk-v5";
import { Row } from 'element-ui';
export default {
    computed: {
        user() {
            return JSON.parse(sessionStorage.getItem("user") || "[]");
        }
    },
    data() {
        return {
            loading: false,
            noteLog: {},
            orgType: "0",
            typeOptions: [
                { label: "运营商", value: 0 },
                { label: "建设单位", value: 2 },
                { label: "系统代理商", value: 1 },
                { label: "设计院", value: 9 },
                { label: "监理公司", value: 3 },
                { label: "施工单位", value: 4 },
                { label: "项目部", value: 5 },
                { label: "供应商", value: 6 },
                { label: "分包商", value: 7 },
            ],
            tableData: [],
            page: {
                pageSize: 10,
                pageNum: 1
            }, //分页数据
            total: 0, //分页总数
            inpData: {
                orgType: "",
                smsStatus: ""
            },
            pickerOptionsEnd: {
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
            pickerRecordFormEnd: {
                disabledDate: time => {
                    if (this.recordForm.beginTime) {
                        let d;
                        if (typeof this.recordForm.beginTime == "string") {
                            d = new Date(this.recordForm.beginTime).getTime();
                        } else {
                            d = this.recordForm.beginTime.getTime();
                        }
                        return time.getTime() < d;
                    }
                }
            },
            pickerRecordFormAnd: {
                disabledDate: time => {
                    if (this.recordForm.endTime) {
                        let d;
                        if (typeof this.recordForm.endTime == "string") {
                            d = new Date(this.recordForm.endTime).getTime();
                        } else {
                            d = this.recordForm.endTime.getTime();
                        }
                        return time.getTime() > d;
                    }
                }
            },
            pickerDetailFormEnd: {
                disabledDate: time => {
                    if (this.detailForm.beginTime) {
                        let d;
                        if (typeof this.detailForm.beginTime == "string") {
                            d = new Date(this.detailForm.beginTime).getTime();
                        } else {
                            d = this.detailForm.beginTime.getTime();
                        }
                        return time.getTime() < d;
                    }
                }
            },
            pickerDetailFormAnd: {
                disabledDate: time => {
                    if (this.detailForm.endTime) {
                        let d;
                        if (typeof this.detailForm.endTime == "string") {
                            d = new Date(this.detailForm.endTime).getTime();
                        } else {
                            d = this.detailForm.endTime.getTime();
                        }
                        return time.getTime() > d;
                    }
                }
            },
            formLabelWidth: "120px",
            show1: false,
            showType: 0,
            form: {
                num: "",
                reason: "",
                paymentCode: "",
                amount: "",
            },
            show2: false,
            warningData: {},
            warningTitle: "",
            alarmType: "",
            approvalType: "",
            paymentData: [],
            accessoryName: "",
            bookUrl: "",
            show3: false,
            detailType: 0,
            detailForm: {
                pageNum: 1,
                pageSize: 10,
                useType: 0,
                fkOrgId: "",
                approvalStatus: "",
                beginTime: "",
                endTime: "",
                userName: ""
            },
            detailTotal: 0,
            detailData: [],
            detailTitle: "",
            show4: false,
            recordForm: {
                pageNum: 1,
                pageSize: 10,
                beginTime: "",
                endTime: "",
                fkOrgId: "",
                smsStatus: "",
                receiveName: "",
                receivePhone: ""
            },
            recordTotal: 0,
            recordData: [],
            recordTitle: "",
            newAddList: [],
            delList: [],
            showStatus: false,
            showUrl: "",
            srcList:[]
        };
    },
    mounted() {
        this.searchNoticPage();
        this.getSMSDetail();
        this.getItemClass();
    },
    methods: {
        getItemClass(){
            this.$api.getItemClass({dictType:34}).then(res=>{
                if(res.code == 200){
                    res.data.forEach(element => {
                        element.value =  element.keyName
                        element.label =  element.keyVal
                    });
                    this.typeOptions = res.data
                }else{
                    this.$message.error(res.msg)
                }
            }) 
        },
        quickLook(row) {
            this.approvalType = this.detailType == 0 ? 1 : 0;
            this.showUrl = ""
            this.srcList =[]
            this.$api.sysSmsRechargeFindById({ pkId: row.pkId }).then(res => {
                if (res.code == 200) {
                    this.show1 = true
                    this.showStatus = true
                    this.form = res.data
                    if (res.data.enclosures.length != 0 && res.data.enclosures != null) {
                        this.showUrl = res.data.enclosures[0].enclosureUrl
                        this.srcList.push(res.data.enclosures[0].enclosureUrl)
                    }
                } else {
                    this.$message.warning(res.msg)
                }
            })
        },
        withdraw(row) {
            this.$confirm("撤回操作系统将会删除该申请记录确定继续撤回操作？", "撤回确认", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(() => {
                this.$api.withdrawRecharge({ pkId: row.pkId }).then(res => {
                    if (res.code === 200) {
                        this.$message.success("撤回成功");
                        this.sysSmsRecharge();
                    } else {
                        this.$message.warning(res.msg);
                    }
                });
            });
        },
        delFiles() {
            let urls = []
            urls = [...new Set([...this.delList, ...this.newAddList])].join(',')
            if (!urls.length) {
                return
            }
            this.newAddList = []
            this.delList = []
            this.$api.delFiles({ urls })
        },
        alarmTelephoneBlur() {
            if (this.warningData.alarmTelephone.length >= 11) {
                const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
                if (!reg.test(this.warningData.alarmTelephone)) {
                    this.$message.warning("请输入正确的手机号");
                    this.warningData.alarmTelephone = ""
                } else {

                }
            } else {
                this.warningData.alarmTelephone = ""
                return this.$message.warning("请输入正确的手机号");
            }
        },
        empty() {
            this.delList.push(this.bookUrl)
            this.bookUrl = null;
            this.$refs.file.value = "";
        },
        //获取签名
        upLoads(sign, folder, file, filename, tmpSecretKey, tmpSecretId, startTime, expiredTime) {
            let bucket = "epms-1307524156";
            let appid = "1256287502";
            let region = "ap-guangzhou";
            let cos = new COS({
                // 必选参数
                getAuthorization: function (options, callback) {
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
            let _this = this;
            cos.uploadFile(
                {
                    Bucket: bucket,
                    Region: region,
                    Key: _this.uploadDate.objectKey + "." + name,
                    Body: file,
                    onProgress: function (progressData) {
                        console.log(JSON.stringify(progressData));
                    }
                },
                function (err, data) {
                    if (data.statusCode == 200) {
                        let path = "https://" + data.Location;
                        _this.newAddList.push(path)
                        _this.bookUrl = path;
                        _this.accessoryName = filename;
                        // _this.getNumPages();
                        _this.loading = false;
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
            this.accessoryName = "";
            let fileObj = document.getElementById("upload").files[0];
            let blobFile = this.$options.methods.dataURLtoBlob.bind(this)(fileObj);
            if(fileObj.size<=0){
              return this.$message.warning("文件大小不能为0kb");
            }
            let filename = fileObj.name;
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
        //上传腾讯云
        uploadFile(sign, folder, file, filename) {
            let bucket = "epms-1307524156";
            let appid = "1256287502";
            let region = "ap-guangzhou";

            let cos = new COS({
                // 必选参数
                getAuthorization: function (options, callback) {
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
        //DataURL转Blob
        dataURLtoBlob(fileObj) {
            return new Blob([fileObj], { type: fileObj.type });
        },
        giveAway(row) {
            this.show1 = true
            this.approvalType = 1

            this.form.orgName = row.orgName
            this.form.managerMobile = row.managerMobile
            this.form.giveResidueNum = row.giveResidueNum
            this.form.rechargeResidueNum = row.rechargeResidueNum
            this.form.fkOrgId = row.fkOrgId
            this.form.num = ""
            this.form.reason = ""
            this.form.paymentCode = ""
            this.form.amount = ""
            this.accessoryName = ""
            this.bookUrl = ""
            this.showStatus = false
        },
        topUp(row) {
            this.showStatus = false
            this.show1 = true
            this.approvalType = 0

            this.form.orgName = row.orgName
            this.form.managerMobile = row.managerMobile
            this.form.giveResidueNum = row.giveResidueNum
            this.form.rechargeResidueNum = row.rechargeResidueNum
            this.form.num = ""
            this.form.reason = ""
            this.form.paymentCode = ""
            this.form.amount = ""
            this.accessoryName = ""
            this.bookUrl = ""
            this.form.fkOrgId = row.fkOrgId
            // console.log(row)

            // 在字典获取支付方式
            this.$store.dispatch("getDictionariesData", 14).then(res => {
                this.paymentData = res;
            });
        },
        examine(row, type) {
            this.show3 = true
            this.detailTitle = type == 0 ? '查看赠送记录 - ' + row.orgName : '查看充值记录-' + row.orgName;
            this.detailType = type
            this.detailForm.approvalStatus = ""

            this.detailForm.beginTime = ""
            this.detailForm.endTime = ""
            this.detailForm.userName = ""
            this.detailForm.pageNum = 1;
            this.detailForm.fkOrgId = row.fkOrgId;
            this.sysSmsRecharge();

        },
        detailSearch() {
            this.detailForm.pageNum = 1;
            this.sysSmsRecharge();
        },
        sysSmsRecharge() {
            this.loading = true
            this.detailType
            let data = { ...this.detailForm }
            data.approvalType = this.detailType == 0 ? 1 : 0;
            this.$api.sysSmsRecharge(data).then(res => {
                if (res.code == 200) {
                    this.detailData = res.data.records;
                    this.detailTotal = res.data.total - 0;
                    this.$refs.detailTable.bodyWrapper.scrollTo(0, 0);
                    this.loading = false
                } else {
                    this.loading = false
                    this.$message.warning(res.msg)
                }
            })
        },
        // pageSize改变
        detailSizeChange(val) {
            this.detailForm.pageNum = 1;
            this.detailForm.pageSize = val;
            this.sysSmsRecharge();
        },
        // current改变
        detailCurrentChange(val) {
            this.detailForm.pageNum = val;
            this.sysSmsRecharge();
        },
        // ===============
        sendDit(row) {
            this.show4 = true
            this.recordTitle = '查看发送记录-' + row.orgName
            this.recordForm = {
                pageNum: 1,
                pageSize: 10,
                beginTime: "",
                endTime: "",
                fkOrgId: row.fkOrgId,
                smsStatus: "",
                receiveName: "",
                receivePhone: ""
            }
            this.searchSMSRecord();
        },
        recordSearch() {
            this.recordForm.pageNum = 1;
            this.searchSMSRecord();
        },
        // pageSize改变
        recordSizeChange(val) {
            this.recordForm.pageNum = 1;
            this.recordForm.pageSize = val;
            this.searchSMSRecord();
        },
        // current改变
        recordCurrentChange(val) {
            this.recordForm.pageNum = val;
            this.searchSMSRecord();
        },
        searchSMSRecord() {
            this.loading = true
            this.$api.searchSMSRecord(this.recordForm).then(res => {
                if (res.code == 200) {
                    this.recordData = res.data.records;
                    this.recordTotal = res.data.total - 0;
                    this.$refs.recordTable.bodyWrapper.scrollTo(0, 0);
                    this.loading = false
                } else {
                    this.loading = false
                    this.$message.warning(res.msg)
                }
            })
        },
        // =============
        submit() {
            let data = {
                approvalType: this.approvalType,
                num: this.form.num,
                reason: this.form.reason,
                fkOrgId: this.form.fkOrgId
            }
            if (this.approvalType == 0) {
                data = {
                    approvalType: this.approvalType,
                    num: this.form.num,
                    paymentCode: this.form.paymentCode,
                    amount: this.form.amount,
                    enclosures: [{ enclosureName: this.accessoryName, enclosureUrl: this.bookUrl }],
                    fkOrgId: this.form.fkOrgId
                }


            }
            if (this.approvalType == 1 && data.num.length == 0) {
                return this.$message.warning("请输入短信条数")
            }
            if (this.approvalType == 1 && !data.reason) {
                return this.$message.warning("请输入赠送原因")
            }
            if (this.approvalType == 0 && data.amount.length == 0) {
                return this.$message.warning("请输入充值金额")
            }
            if (this.approvalType == 0 && data.num.length == 0) {
                return this.$message.warning("请输入短信条数")
            }

            if (this.approvalType == 0 && data.paymentCode.length == 0) {
                return this.$message.warning("请选择充值方式")
            }
            if(this.approvalType == 0 && !data.enclosures.length){
                return this.$message.warning("请上传充值证明")
            }
            this.loading = true;
            this.$api.sysSmsRechargeAdd(data).then(res => {
                this.loading = false;
                if (res.code == 200) {
                    this.callOff(true);
                    this.$message.success("操作成功")
                    this.searchNoticPage()//刷新
                } else {
                    this.$message.warning(res.msg)
                }
            })

        },
        callOff(isDel) {
            this.show1 = false
            if (!isDel) {
                this.delList = []
                this.delFiles()
            } else {
                this.newAddList = []
                this.delFiles()
            }
        },
        earlyWarning(type) {
            this.alarmType = type
            if (type == 0) {
                this.warningTitle = "短信不足预警"
            } else {
                this.warningTitle = "短信消费过快预警"
            }
            this.show2 = true
            this.$api.findByOrgId({ alarmType: type,alarmSource:1}).then(res => {
                if (res.code == 200) {
                    this.warningData = res.data
                    this.show2 = true
                } else {
                    this.$message.warning(res.msg)
                }
            })
        },
        ensure() {
            let data = {
                alarmType: this.alarmType,
                enableStatus: this.warningData.enableStatus,
                alarmSource: 1
            }

            if (this.warningData.enableStatus == 1) {
                data.alarmTelephone = this.warningData.alarmTelephone;
                data.firstCondition = this.warningData.firstCondition


            }

            if (this.warningData.pkId == null) {
                this.loading = true;
                this.$api.sysSmsAlarmSetAdd(data).then(res => {
                    this.loading = false;
                    if (res.code == 200) {
                        this.$message.success("操作成功")
                        this.cancel()
                    } else {
                        this.$message.warning(res.msg)
                    }
                })
            } else {
                data.pkId = this.warningData.pkId
                this.loading = true;
                this.$api.sysSmsAlarmSetUpdate(data).then(res => {
                    this.loading = false;
                    if (res.code == 200) {
                        this.$message.success("操作成功")
                        this.cancel()
                    } else {
                        this.$message.warning(res.msg)
                    }
                })
            }
        },

        cancel() {
            this.show2 = false
        },
        delBtn(row) {
            this.$confirm("确定删除该短信签名申请？", "删除确认", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(() => {
                this.loading = true;
                this.$api.sysSmsRechargeDelete({ pkId: row.pkId }).then(res => {
                    this.loading = false;
                    if (res.code === 200) {
                        this.$message.success("删除成功");
                        this.searchNoticPage();
                    } else {
                        this.$message.warning(res.msg);
                    }
                });
            });
        },

        btnSearch() {
            this.page.pageNum = 1;
            this.searchNoticPage();
        },
        orgTypeChange() {
            // : {
            this.inpData.orgType = ""
            this.inpData.smsStatus = ""
            // },
            this.page.pageNum = 1;
            this.searchNoticPage();
        },
        // pageSize改变
        handleSizeChange(val) {
            this.page.pageNum = 1;
            this.page.pageSize = val;
            this.searchNoticPage();
        },
        // current改变
        handleCurrentChange(val) {
            this.page.pageNum = val;
            this.searchNoticPage();
        },
        searchNoticPage() {
            let data = {
                ...this.page,
                ...this.inpData
            };
            if (this.orgType == 0) {
                this.$api.searchSMSGroupByOrg(data).then(res => {
                    if (res.code === 200) {
                        this.tableData = res.data.records;
                        this.total = res.data.total - 0;
                        this.$refs.tables.bodyWrapper.scrollTo(0, 0);
                    } else {
                        this.$message.warning(res.msg);
                    }
                });
            } else {
                this.$api.searchSMSRecord(data).then(res => {
                    if (res.code === 200) {
                        this.tableData = res.data.records;
                        this.total = res.data.total - 0;
                        this.$refs.tables.bodyWrapper.scrollTo(0, 0);
                    } else {
                        this.$message.warning(res.msg);
                    }
                });
            }

        },
        // 头部信息
        getSMSDetail() {
            this.$api.getSMSDetail().then(res => {
                if (res.code == 200) {
                    this.noteLog = res.data
                } else {
                    this.$message.warning(res.msg)
                }
            })
        },
        // 禁止输入事件
        keyDown(e) {
            const key = e.key;
            if (key === "e" || key === "-" || key === "." || key == "+") {
                e.returnValue = false;
                return false;
            }
            return true;
        }
    }
};
</script>

<style lang="scss" scoped>
.short-note {
    width: 70%;
}

.short-message {
    position: relative;
    padding: 15px;
    background-color: #fff;
    border-radius: 5px;

    .message-item {
        display: inline-block;
        padding: 7px 40px;
        background-color: #ecf5ff;
        border-radius: 5px;

        .item-label {
            line-height: 40px;
            font-size: 14px;

            .num {
                font-size: 24px;
            }
        }
    }

    .message-btn {
        position: absolute;
        right: 8px;
        top: 25px;
    }
}

// .relative {
//     background-color: #fff;
//     position: relative;

//     .absolute {
//         position: absolute;
//         right: 12px;
//         top: 2px;
//     }
// }

.header-seach {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    padding: 0 20px;
    // margin-bottom: 5px;
    border-radius: 5px;

    .myform {
        align-items: center;
        margin-top: 10px;
    }

    .search-right {
        display: flex;
        align-items: center;

        .el-radio-group {
            display: flex;
        }
    }
}
.search-bar-box{
    padding: 0;
    height: 80px;
    line-height: 80px;
    padding-left: 10px;
    /deep/ .el-form--inline .el-form-item__content {
        vertical-align: middle;
    }
}
.search {
    margin-top: 6px;
}

.mb-10 {
    margin-bottom: 10px;
}

.mr-20 {
    margin-right: 20px;
}

.succeed {
    color: #67C23A;
}

.failure {
    color: #F56C6C;
}

.dialog-footer {
    text-align: center;
}

/deep/.el-form {
    .el-form-item {
        margin-bottom: 5px !important;
    }
}

.short-note {
    width: 70%;
    height: 80px;

    .short-note-item {
        display: flex;
        align-items: center;
        height: 40px;
    }

    .num {
        font-size: 20px;
        font-weight: 600;
    }

    .orange {
        color: #f59a23;
    }
}

/deep/ .el-tabs__header {
    background-color: #fff;
}

/deep/ .el-tabs__nav-wrap {
    padding-left: 20px;
}
</style>
