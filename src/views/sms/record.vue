<!-- 短信记录 -->
<template>
    <div class="app-container">
        <div class="header-seach search-bar-box">
            <el-form :inline="true" class="myform" label-width="72px">
                <el-form-item label="类型" label-width="40px">
                    <el-select v-model="inpData.smsStatus" size="mini" class="wh-140">
                        <el-option value="" label="全部"></el-option>
                        <el-option v-for="item in typeOptions" :key="item.value" :value="item.value"
                            :label="item.label"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="发送日期">
                    <el-date-picker size="mini" :picker-options="pickerOptionsAnd" class="wh-140" value-format="yyyy-MM-dd"
                        v-model="inpData.beginTime"></el-date-picker>
                    <span>至</span>
                    <el-date-picker size="mini" :picker-options="pickerOptionsEnd" class="wh-140" value-format="yyyy-MM-dd"
                        v-model="inpData.endTime"></el-date-picker>
                </el-form-item>
                <el-form-item label="接收人">
                    <el-input size="mini" v-model="inpData.receiveName" maxlength="25"></el-input>
                </el-form-item>
                <el-form-item label="接收人手机号码" label-width="110px">
                    <el-input size="mini" v-model="inpData.receivePhone" type="number"  oninput="if(value.length>11)value=value.slice(0, 11)" maxlength="11"  @keydown.native="keyDown"></el-input>
                </el-form-item>
                <el-button size="mini" type="primary" icon="el-icon-search"  class="ml-20 search el-button-primary" @click="btnSearch">查询</el-button>
            </el-form>
        </div>
        <div class="table-data" style="height:88%;margin-top: 10px;">
        <el-table stripe height="90%" ref="tables" :data="tableData" :header-cell-style="{ background: '#f1f6ff' }">
            <el-table-column label="序号" align="center" width="60">
                <template slot-scope="scope">
                    <div style="text-align: center">
                        {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="接收人" align="center" prop="receiveName"  width="100" show-overflow-tooltip> </el-table-column>
            <el-table-column label="接收手机号码" align="center" prop="receivePhone" width="110" show-overflow-tooltip></el-table-column>
            <el-table-column label="发送内容" align="center" prop="smsContent" show-overflow-tooltip> </el-table-column>
            <el-table-column label="短信条数" align="center" prop="smsNumber" width="100" show-overflow-tooltip> </el-table-column>
            <el-table-column label="发送人" align="center" prop="createUser" width="100" show-overflow-tooltip> </el-table-column>
            <el-table-column label="发送时间" align="center" prop="createTime" width="150" show-overflow-tooltip> </el-table-column>
            <el-table-column label="状态" align="center" prop="smsStatus" width="100">
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
        <tablePaging :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></tablePaging>
    </div>
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
            typeOptions: [
                { label: "发送中", value: 0 },
                { label: "发送成功", value: 1 },
                { label: "发送失败", value: 2 }
            ],
            tableData: [],
            page: {
                pageSize: 10,
                pageNum: 1
            }, //分页数据
            total: 0, //分页总数
            inpData: {
                smsStatus: "",
                receiveName: "",
                beginTime: "",
                endTime: "",
                receivePhone: ""
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
        };
    },
    mounted() {
        this.searchNoticPage();
    },
    methods: {

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
            this.$api.sysSmsSearchPage(data).then(res => {
                if (res.code === 200) {
                    this.tableData = res.data.records;
                    this.total = res.data.total - 0;
                    this.$refs.tables.bodyWrapper.scrollTo(0, 0);
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
        }
    }
};
</script>
  
<style lang="scss" scoped>
.header-seach {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    padding: 0 20px;
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
.succeed{
    color: #67C23A;
}
.failure{
    color: #F56C6C;
}
.search-bar-box{
    /deep/ .el-form-item__content{
        vertical-align: middle;
    }
}
</style>
  