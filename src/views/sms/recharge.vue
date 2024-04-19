<!-- 短信充值 -->
<template>
    <div class="app-container">
        <div class="short-message">
            <div class="message-item">
                <div class="item-label"> 上月消耗短信：<span style="color:#1890ff;"><span class="num" style="font-size: 24px;">{{
                    noteLog.lastMonthConsume }}</span> 条 </span></div>
                <div class="item-label"> 本月消耗短信：<span style="color:#1890ff;"><span class="num" style="font-size: 24px;">{{
                    noteLog.thisMonthConsume }}</span> 条 </span></div>
            </div>
            <div class="message-item">
                <div class="item-label">赠送条数： <span style="color:#1890ff;"><span class="num">{{ noteLog.giveSum
                }}</span> 条</span></div>
                <div class="item-label"> 充值总数：<span style="color:#1890ff;"><span class="num">{{ noteLog.rechargeSum
                }}</span> 条 </span></div>
            </div>
            <div class="message-item">
                <div class="item-label">已使用总数： <span style="color:#1890ff;"><span class="num">{{ noteLog.useSum
                }}</span> 条</span></div>
                <div class="item-label"> 当前剩余短信：<span style="color:#1890ff;"><span class="num">{{ noteLog.residueSum
                }}</span> 条 </span></div>
            </div>
            <div class="message-btn">
                <el-button size="mini" type="primary" class="el-button-primary" v-has="'sms:recharge:insufficientSetting'"  @click="earlyWarning">短信不足预警设置</el-button>
            </div>
        </div>
        <div class="header-seach search-bar-box">
            <el-form :inline="true" class="myform" label-width="72px">
                <el-form-item label="类型" label-width="40px">
                    <el-select v-model="inpData.approvalType" size="mini" class="wh-140">
                        <el-option value="" label="全部"></el-option>
                        <el-option v-for="item in typeOptions" :key="item.value" :value="item.value"
                            :label="item.label"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="查询日期">
                    <el-date-picker size="mini" :picker-options="pickerOptionsAnd" class="wh-140" value-format="yyyy-MM-dd"
                        v-model="inpData.beginTime"></el-date-picker>
                    <span>至</span>
                    <el-date-picker size="mini" :picker-options="pickerOptionsEnd" class="wh-140" value-format="yyyy-MM-dd"
                        v-model="inpData.endTime"></el-date-picker>
                </el-form-item>
                <el-button size="mini" type="primary"  icon="el-icon-search" class="ml-20 search el-button-primary" @click="btnSearch">查询</el-button>
            </el-form>
        </div>
        <div class="table-data" style="height:71%;margin-top: 10px;">
        <el-table stripe height="88%" ref="tables" :data="tableData" :header-cell-style="{ background: '#f1f6ff' }">
            <el-table-column label="序号" align="center" width="60">
                <template slot-scope="scope">
                    <div style="text-align: center">
                        {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="赠送/充值时间" align="center" prop="createTime" min-width="130"> </el-table-column>
            <el-table-column label="类型" align="center" prop="paymentCode" min-width="110"></el-table-column>
            <el-table-column label="订单号" align="center" prop="orderCode" min-width="110"> </el-table-column>
            <el-table-column label="赠送/充值 前短信数量" align="center" prop="smsNumber" min-width="140">
                <template slot-scope="{ row }">
                    {{ row.preGiveNum + row.preRechargeNum }}
                </template>
            </el-table-column>
            <el-table-column label="赠送/充值 短信数量" align="center" prop="num" min-width="130"></el-table-column>
            <el-table-column label="赠送/充值 后短信数量" align="center" prop="createTime" min-width="150">
                <template slot-scope="{ row }">
                    {{ row.afterGiveNum + row.afterRechargeNum }}
                </template>
            </el-table-column>
            <el-table-column label="金额" align="center" prop="amount"> </el-table-column>
            <el-table-column label="状态" align="center" prop="approvalStatus">
                <template slot-scope="{ row }">
                    <span v-if="row.approvalStatus == 0">待支付</span>
                    <span v-if="row.approvalStatus == 1" class="succeed">
                        {{row.paymentCode== '自助充值' ?'支付成功':'成功'}}
                    </span>
                    <span v-if="row.approvalStatus == 2" class="failure">失败</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" prop="smsStatus" width="150px">
                <template slot-scope="{ row }">
                    <el-button type="primary" plain v-has="'sms:recharge:query'" size="mini" @click="examine(row)">查看</el-button>
                    <el-button type="danger" plain v-has="'sms:recharge:delete'" v-if="row.approvalStatus != 1 && row.approvalStatus != 3" @click="delBtn(row)" size="mini">删除</el-button>
                </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
            </div>
        </el-table>
        <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum"
            @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></tablePaging>
        </div>    
        <el-dialog :title="showTitle" width="500px" :visible.sync="show1" v-dialogDrag :close-on-click-modal="false"
            :close-on-press-escape="false" v-loading="loading">
            <el-form :model="form" ref="form" class="dialog-form form-row" >
                <el-form-item label="企业名称" prop="templateName" :label-width="formLabelWidth">
                    {{ form.orgName }}
                </el-form-item>
                <el-form-item label="管理员手机号码" prop="templateContent" :label-width="formLabelWidth">
                    {{ form.managerMobile }}
                </el-form-item>
                <el-form-item :label="showTitle=='赠送短信信息'?'赠送前短信':'充值前短信'" prop="templateContent" :label-width="formLabelWidth">
                    赠送{{ form.preGiveNum }}+充值{{ form.preRechargeNum }}条
                </el-form-item>
                <el-form-item v-if="showTitle=='赠送短信信息'" label="赠送短信" prop="templateContent" :label-width="formLabelWidth">
                    {{ form.num }}条
                </el-form-item>
                <el-form-item v-if="showTitle=='线下充值短信信息'" label="充值金额" prop="templateContent" :label-width="formLabelWidth">
                    {{ form.amount }}元
                </el-form-item>
                <el-form-item v-if="showTitle=='线下充值短信信息'" label="充值短信" prop="templateContent" :label-width="formLabelWidth">
                    {{ form.num }}条
                </el-form-item>
                <el-form-item v-if="showTitle=='线下充值短信信息'" label="充值方式" prop="templateContent" :label-width="formLabelWidth">
                    {{ form.paymentCode }}
                </el-form-item>
                <el-form-item :label="showTitle=='赠送短信信息'?'赠送后短信':'充值后短信'"  prop="templateContent" :label-width="formLabelWidth">
                    赠送{{ form.afterGiveNum }}+充值{{ form.afterRechargeNum }}条
                </el-form-item>
                <el-form-item :label="showTitle=='赠送短信信息'?'赠送时间':'充值时间'" prop="templateContent" :label-width="formLabelWidth">
                    {{ form.createTime }}
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog title="短信不足预警" width="500px" :visible.sync="show2" v-dialogDrag :close-on-click-modal="false"
            :close-on-press-escape="false" v-loading="loading">
            <el-form ref="form" class="dialog-form">
                <el-form-item label="" prop="templateName" label-width="0px">
                    <el-select v-model="warningData.enableStatus" size="mini" class="wh-140">
                        <el-option :value="0" label="不启用预警"></el-option>
                        <el-option :value="1" label="启用预警"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="系统短信剩余不足" prop="templateContent" label-width="130px"
                    v-if="warningData.enableStatus == 1">
                    <el-input size="mini" class="wh-200" maxlength="8"  type="number" oninput="if(value.length>8)value=value.slice(0, 8)"  @keydown.native="keyDown" v-model="warningData.firstCondition"></el-input>条进行短信通知预警
                </el-form-item>
                <el-form-item label="预警通知手机号码" prop="templateContent" label-width="130px"
                    v-if="warningData.enableStatus == 1">
                    <el-input size="mini" class="wh-200" v-model="warningData.alarmTelephone" type="number" @blur="alarmTelephoneBlur"
                        oninput="if(value.length>11)value=value.slice(0, 11)" maxlength="11"
                        @keydown.native="keyDown"></el-input>
                </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="mini" @click="cancel">取 消</el-button>
                <el-button size="mini" type="primary" class="el-button-primary" @click="ensure">保 存</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
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
            typeOptions: [
                { label: "充值", value: 0 },
                { label: "赠送", value: 1 },
            ],
            tableData: [],
            page: {
                pageSize: 10,
                pageNum: 1
            }, //分页数据
            total: 0, //分页总数
            inpData: {
                useType: 1,
                beginTime: "",
                endTime: "",
                approvalType: ""
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
            formLabelWidth: "120px",
            show1: false,
            showType: 0,
            form: {},
            show2: false,
            warningData: {},
            showTitle:""
        };
    },
    mounted() {
        this.searchNoticPage();
        this.getSMSDetailByOrgId();
    },
    methods: {
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
        earlyWarning() {
            this.$api.findByOrgId({ alarmType: 0,alarmSource:0 }).then(res => {
                if (res.code == 200) {
                    this.warningData = res.data
                    this.show2 = true
                } else {
                    this.$message.warning(res.msg)
                }
            })
        },
        examine(row) { 
            this.showTitle = row.paymentCode == "赠送"?"赠送短信信息":"线下充值短信信息";
            this.show1 = true
            this.sysSmsRechargeFindById(row.pkId)
        },
        sysSmsRechargeFindById(pkId) {
            this.$api.sysSmsRechargeFindById({ pkId }).then(res => {
                if (res.code == 200) {
                    this.form = res.data
                } else {
                    this.$message.warning(res.msg)
                }
            })
        },
        ensure() {
            let data = {
                alarmType: 0,
                enableStatus: this.warningData.enableStatus,
                alarmSource:0
            }

            if (this.warningData.enableStatus == 1) {
                data.alarmTelephone = this.warningData.alarmTelephone;
                data.firstCondition = this.warningData.firstCondition
            }
            if(this.warningData.enableStatus == 1 && this.warningData.alarmTelephone.length == 0){
                return this.$message.warning("请输入手机号码")
            }
            if(this.warningData.enableStatus == 1 && this.warningData.firstCondition.length == 0){
                return this.$message.warning("请输入短信条数")
            }
            if (this.warningData.pkId == null) {
                 this.loading= true;
                this.$api.sysSmsAlarmSetAdd(data).then(res => {
                     this.loading= false;
                    if (res.code == 200) {
                        this.$message.success("操作成功")
                        this.cancel()
                    } else {
                        this.$message.warning(res.msg)
                    }
                })
            } else {
                data.pkId = this.warningData.pkId
                 this.loading= true;
                this.$api.sysSmsAlarmSetUpdate(data).then(res => {
                     this.loading= false;
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
                this.$api.sysSmsRechargeDelete({ pkId: row.pkId }).then(res => {
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
            this.$api.sysSmsRecharge(data).then(res => {
                if (res.code === 200) {
                    this.tableData = res.data.records;
                    this.total = res.data.total - 0;
                    this.$refs.tables.bodyWrapper.scrollTo(0, 0);
                } else {
                    this.$message.warning(res.msg);
                }
            });
        },
        // 头部信息
        getSMSDetailByOrgId() {
            this.$api.getSMSDetailByOrgId().then(res => {
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
        top: 20px;
    }
}



.relatives {
    position: relative;
    width: 100%;
    height: 80px;
    .absolute {
        position: absolute;
        right: 12px;
        top: 2px;
    }
    .line{
        position: absolute;
        left: 360px;
        top: 0;
        bottom: 0;
        border-right: 1px solid #d7d7d7;
    }
}

.short-note {
    width: 70%;
    height: 80px;
    .short-note-item{
        display: flex;
        align-items: center;
        height: 40px;
    }
    .num{
        font-size: 20px;
        font-weight: 600;
    }
    .orange{
        color: #f59a23;
    }
}

.header-seach {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    padding: 0 20px;
    // height: 80px;
    margin-bottom: 5px;
    border-radius: 5px;
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
.form-row{
    padding-bottom: 20px;
    /deep/ .el-form-item{
        margin-bottom: 0;
    }
}
.search-bar-box{
    /deep/ .el-form-item__content{
        vertical-align: middle;
    }
}
.search-bar-box{
    /deep/ .el-form-item__content{
        vertical-align: middle;
    }
}

</style>
  