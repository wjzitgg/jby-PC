<!-- 短信配置 -->
<template>
    <div class="app-container">
        <!-- <div class="header-seach"> -->
        <el-form :inline="true" class="myform search-bar-box" label-width="72px">
            <el-form-item label="状态" label-width="40px">
                <el-select v-model="inpData.enableStatus" size="mini" class="wh-140">
                    <el-option value="" label="全部"></el-option>
                    <el-option v-for="item in typeOptions" :key="item.value" :value="item.value"
                        :label="item.label"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="关键字">
                <el-input size="mini" v-model="inpData.keyWord" maxlength="20"></el-input>
            </el-form-item>
            <el-button size="mini" type="primary" icon="el-icon-search" class="ml-20 search el-button-primary"
                @click="btnSearch">查询</el-button>
        </el-form>
        <!-- </div> -->
        <div class="table-data" style="height: 89%; margin-top: 10px;">
            <el-table stripe height="92%" ref="tables" :data="tableData" :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
                <el-table-column label="序号" align="center" width="60">
                    <template slot-scope="scope">
                        <div style="text-align: center">
                            {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="使用场景" align="center" prop="templateName" width="100"> </el-table-column>
                <el-table-column label="类型" align="center" prop="sceneType" width="110">
                    <template slot-scope="{ row }">
                        <span v-if="row.sceneType == 0">系统指定</span>
                        <span v-if="row.sceneType == 1">无场景</span>
                    </template>
                </el-table-column>
                <el-table-column label="短信内容" align="center" prop="templateContent" show-overflow-tooltip> </el-table-column>
                <el-table-column label="备注" align="center" prop="remark" width="160" show-overflow-tooltip> </el-table-column>
                <el-table-column label="操作" align="center" width="100">
                    <template slot-scope="{ row }">
                        <el-switch :disabled="row.allow == 0" v-has="'sms:setting:editStatus'" v-model="row.enableStatus"
                            @change="triggerStatus(row.pkId)" active-color="#13ce66" inactive-color="#ff4949"
                            :active-value="0" :inactive-value="1">
                            <!-- active-value="1" inactive-value="0" -->
                        </el-switch>
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
                { label: "禁用", value: 1 },
                { label: "启用", value: 0 },
            ],
            tableData: [],
            page: {
                pageSize: 10,
                pageNum: 1
            }, //分页数据
            total: 0, //分页总数
            inpData: {
                enableStatus: "",
                keyWord: "",
            },

        };
    },
    mounted() {
        this.searchNoticPage();
    },
    methods: {
        triggerStatus(pkId) {
            this.$api.triggerStatus({ pkId }).then(res => {
                if (res.code == 200) {
                    this.$message.success(res.msg)
                    this.searchNoticPage();
                } else {
                    this.$message.warning(res.msg)
                    this.searchNoticPage();
                }
            })
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
            this.$api.orgTemplate(data).then(res => {
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
    // background-color: #f3f3f3;
    // padding: 0 10px;
    margin-bottom: 5px;


    .search-right {
        display: flex;
        align-items: center;

        .el-radio-group {
            display: flex;
        }
    }
}

.myform {
    align-items: center;

    // margin-top: 20px;
    /deep/ .el-form-item {
        margin-bottom: 0;
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
.search-bar-box{
    /deep/ .el-form-item__content{
        vertical-align: middle;
    }
}
</style>
  