<!-- 短信模板 -->
<template>
    <div class="app-container">
        <div class="header-seach search-bar-box" style="position: relative;">
            <el-form :inline="true" class="myform" label-width="72px" >
                <el-form-item label="模板名称">
                    <el-input size="mini" v-model="inpData.templateName" maxlength="50"></el-input>
                </el-form-item>
                <el-button size="mini" type="primary" icon="el-icon-search" class="ml-20 search el-button-primary" @click="btnSearch">查询</el-button>
                <el-button v-has="'sms:template:add'" style="position: absolute;top: 30px;right: 40px;" size="mini" class="add el-button-primary" type="primary" @click="add">新增</el-button>
            </el-form>
        </div>
        <div class="table-data" style="height:88%;margin-top: 10px;">
        <el-table stripe height="90%" ref="tables" :data="tableData" :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
            <el-table-column label="序号" align="center" width="60">
                <template slot-scope="scope">
                    <div style="text-align: center">
                        {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="模板名称" align="center" prop="templateName"> </el-table-column>
            <el-table-column label="模板内容" align="center" prop="templateContent"></el-table-column>
            <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip></el-table-column>
            <el-table-column label="操作" align="center" prop="smsStatus" width="220">
                <template slot-scope="{ row }">
                    <el-button plain v-has="'sms:template:query'" type="primary" size="mini" @click="viewEdit(row.pkId, 0)">查看</el-button>
                    <el-button plain v-has="'sms:template:edit'" type="warning" size="mini" @click="viewEdit(row.pkId, 1)">编辑</el-button>
                    <el-button plain v-has="'sms:template:delete'" type="danger" @click="delBtn(row)" size="mini">删除</el-button>
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
        <el-dialog :title="addTitle" width="500px" :visible.sync="show1" v-dialogDrag :close-on-click-modal="false"
            :close-on-press-escape="false" v-loading="loading">
            <el-form :model="form" ref="form" :rules="rules" class="dialog-form">
                <el-form-item label="模板名称" prop="templateName" :label-width="formLabelWidth">
                    <el-input size="mini" v-model="form.templateName" autocomplete="off" :disabled="showType == 0" maxlength="50"></el-input>
                </el-form-item>
                <el-form-item label="模板内容" prop="templateContent" :label-width="formLabelWidth">
                    <el-input  size="mini" v-model="form.templateContent" type="textarea" style="resize: none" :disabled="showType == 0" :rows="5"
                        maxlength="250" placeholder="请输入内容" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="备注" prop="remark" :label-width="formLabelWidth">
                    <el-input  size="mini" v-model="form.remark" type="textarea" style="resize: none" :disabled="showType == 0" :rows="3"
                        maxlength="100" placeholder="请输入内容" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div style="height:10px" v-if="showType == 0"></div>
            <div slot="footer" class="dialog-footer" v-if="showType != 0">
                <el-button size="mini" @click="cancel">取 消</el-button>
                <el-button size="mini" type="primary" class="el-button-primary" @click="submit('form')">保 存</el-button>
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

            tableData: [],
            page: {
                pageSize: 10,
                pageNum: 1
            }, //分页数据
            total: 0, //分页总数
            inpData: {
                templateName: "",
            },
            addTitle: "",
            show1: false,
            form: {},
            rules: {
                templateName: [
                    {
                        required: true,
                        message: "模板名称不能为空",
                        trigger: ["change", "blur"]
                    }
                ],
                templateContent: [
                    {
                        required: true,
                        message: "模板内容不能为空",
                        trigger: ["change", "blur"]
                    }
                ],
            },
            formLabelWidth: "80px",
            showType: 0
        };
    },
    mounted() {
        this.searchNoticPage();
    },
    methods: {
        cancel() {
            this.show1 = false
            this.$refs['form'].resetFields();
        },
        // 
        delBtn(row) {
            this.$confirm("确定删除该短信模板？", "删除确认", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(() => {
                this.$api.smsTemplateDelete({ pkId: row.pkId }).then(res => {
                    if (res.code === 200) {
                        this.$message.success("删除成功");
                        this.searchNoticPage();
                    } else {
                        this.$message.warning(res.msg);
                    }
                });
            });
        },
        viewEdit(id, type) {
            if (type == 0) {
                this.addTitle = "信息页面"
                this.showType = 0
            } else {
                this.addTitle = "编辑页面"
                this.showType = 2
            }
            this.show1 = true
            this.smsTemplateFindById(id)
        },
        smsTemplateFindById(pkId) {
            this.$api.smsTemplateFindById({ pkId }).then(res => {
                if (res.code == 200) {
                    this.form = res.data
                } else {
                    this.$message.warning(res.msg)
                }
            })
        },
        submit(formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    let data = { ...this.form }
                    this.loading = true;
                    if (this.showType == 1) {
                        this.$api.smsTemplateAdd(data).then(res => {
                            if (res.code == 200) {
                                this.loading = false;
                                this.$message.success("操作成功")
                                this.show1 = false;
                                this.searchNoticPage();
                                this.$refs[formName].resetFields();
                            } else {
                                this.loading = false;
                                this.$message.warning(res.msg)
                            }
                        });
                    } else {
                        this.$api.smsTemplateUpdate(data).then(res => {
                            if (res.code == 200) {
                                this.loading = false;
                                this.$message.success("操作成功")
                                this.show1 = false;
                                this.searchNoticPage();
                                this.$refs[formName].resetFields();
                            } else {
                                this.loading = false;
                                this.$message.warning(res.msg)
                            }
                        });
                    }
                } else {
                    return false;
                }
            });
        },
        add() {
            this.show1 = true
            this.addTitle = "新增页面"
            this.showType = 1
            this.form={
                templateContent:"",
                templateName:"",
                remark:""
            }
            this.$nextTick(() => {
                this.$refs['form'].resetFields();
            })
        },

        // 搜索
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
            this.$api.smsTemplateSearchPage(data).then(res => {
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

.succeed {
    color: #67C23A;
}

.failure {
    color: #F56C6C;
}

.dialog-footer {
    text-align: center;
}
.search-bar-box{
    /deep/ .el-form-item__content{
        vertical-align: middle;
    }
}
</style>
  