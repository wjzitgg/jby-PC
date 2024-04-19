<template>
    <el-dialog :close-on-press-escape="false" title="选择人员" width="80%" height="460px" top="5vh" :visible="show" v-dialogDrag
        :close-on-click-modal="false" v-loading="loading" @close="closeCheckDialog">
        <div class="app-container manage">
            <div class="people">
                <div @click="dianjiwa" class="dianjiwa">{{ company }}</div>
                <!-- 引入员工树形组建 -->
                <people :tree="dataStaff" :defaultProps="defaultProps" @peopleInfo="peopleInfo"></people>
            </div>
            <!-- 员工表格 -->
            <div class="sheet">
                <!-- 头部搜索 -->
                <div class="search-bgc search-mr">
                    <el-form :model="form" class="form-data">
                        <el-form-item label="员工姓名" label-width="80px">
                            <el-input v-model="userName" size="mini" class="wh-100"></el-input>
                        </el-form-item>
                        <el-form-item label="性别" label-width="60px">
                            <el-select v-model="sex" placeholder="请选择" size="mini" class="wh-80">
                                <el-option label="全部" value=""></el-option>
                                <el-option label="男" value="1"></el-option>
                                <el-option label="女" value="2"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="手机号码" label-width="80px">
                            <el-input v-model="telephone" size="mini" maxlength="11" class="wh-120" type="number"
                                oninput="if(value.length>11)value=value.slice(0, 11)"></el-input>
                        </el-form-item>
                        <el-form-item label="所属部门" label-width="80px">
                            <el-select v-model="form.fkDeptId" placeholder="请选择" size="mini" class="wh-100">
                                <el-option v-for="(item,index) in options" :key="index" :label="item.deptName"
                                    :value="item.pkId">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="所属角色" label-width="80px">
                            <el-select v-model="form.fkRoleId" placeholder="请选择" size="mini" class="wh-120">
                                <el-option v-for="(item,index) in roleList" :key="index" :label="item.roleName"
                                    :value="item.pkId">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <!-- <el-form-item label="账号状态" label-width="80px">
                            <el-select v-model="form.enableStatus" placeholder="请选择" size="mini" class="wh-80">
                                <el-option label="全部" value=""></el-option>
                                <el-option label="正常" value="1"></el-option>
                                <el-option label="禁用" value="0"></el-option>
                            </el-select>
                        </el-form-item> -->
                        <el-button type="primary" size="mini" icon="el-icon-search" class="seek el-button-primary"
                            @click="searchData">查询</el-button>
                    </el-form>
                </div>
                <div class="table-data">
                    <el-table :data="tableData" ref="tables" stripe v-loading="loading" height="98%"
                        :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
                        <el-table-column label="选择" width="80" align="center">
                            <template slot-scope="{row}">
                                <el-button plain size="mini" :class="{'forbidden':row.effectiveStats=='1'}" :disabled="row.effectiveStats=='1'" type="primary" @click="selectUser(row)">选择</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column prop="userName" label="员工姓名" align="center"> </el-table-column>
                        <el-table-column prop="sex" label="性别" width="60" align="center" show-overflow-tooltip>
                            <!-- <template slot-scope="{ row }">
                                <span v-if="row.sex == 1">男</span>
                                <span v-if="row.sex == 2">女</span>
                            </template> -->
                        </el-table-column>
                        <el-table-column prop="telephone" label="手机号码" align="center" show-overflow-tooltip> </el-table-column>
                        <el-table-column prop="deptName" label="所属部门" align="center" show-overflow-tooltip> </el-table-column>
                        <el-table-column prop="roleName" label="所属角色" align="center" show-overflow-tooltip> </el-table-column>
                        <div slot="empty" class="empty" style="width: 100%">
                            <img src="@/assets/empty.svg" class="zanwu" />
                            <span>暂无数据</span>
                        </div>
                    </el-table>
                </div>
                <!-- 分页 -->
                <pageInation :currentPage="pageNum" :pageSize="pageSize" :total="total" @handleSizeChange="handleSizeChange"
                    @handleCurrentChange="handleCurrentChange"></pageInation>
            </div>
        </div>
    </el-dialog>
</template>
  
<script>
// 引入员工管理组建
import people from "@/components/staff/people";
import pageInation from "../../../components/tablePaging";
import permIssion from "../../../components/permission/permission";
// import dataPermisson from './compoments/dataPermisson.vue';
export default {
    name: "staff",
    props: {
        show: {
            type: Boolean,
            default: false
        },
        fkSealId: ""
    },
    watch: {
        show(val) {
            if (val) {
                this.getAllDeptAndStaff();
                this.getData();
                // 获取部门
                this.getDepartment();
                this.getRoles();
            }
        }
    },
    data() {
        return {
            searchName: "", // 搜索名字
            searchMoble: "", // 手机号
            dataStaff: [],
            // 左边树形结构绑定数据字段
            defaultProps: {
                children: "children",
                label: "aliasName"
            },
            tableData: [], // 右侧表格数据
            loading: false,
            popup: false,
            typeStatus: false, // 输入框状态
            form: {
                addMenuListSet: [],
                fkRoleId: "", // 角色idjihe
                fkDeptId: "", // 部门
                loginName: "", // 系统账号
                userName: "",
                sex: "",
                telephone: "",
                remark: "",
                projectIdListSet: [], // 项目集合-项目主键id, orgType= 2 建设单位（业主方） 3监理公司 4施工单位时,用到
                enableStatus: "",
                code: "",
                dataCode: ""
            },
            // 部门
            options: [
                {
                    deptName: "全部",
                    pkId: ""
                }
            ],
            // 角色
            roleList: [
                {
                    pkId: "",
                    roleName: "全部"
                }
            ],
            // treeData: [], //    权限组件
            // treeData2: [], //    权限组件
            selectTree: [], //    选择的
            selectTree2: [], //    选择的
            pageNum: 1,
            pageSize: 10,
            total: 0,
            roleListdata: [], // 最开始拥有的角色id，用来处理新增的id  和删除的id  艹
            company: "", // 公司
            companyId: "",
            itemList: [],
            // addRoleIdList: [],
            btnDisabled: false,
            tabType: "1",
            userName: "",
            sex: "",
            telephone: "",
            codeStatus: false,
            // timerStatus: true,
            // timer: 60,
            uuid: "",
            // imgCode: "",
            // verify: false,
            // identifyingCode: "",
            // treeData3: [],
            selectTree3: [],
            manageAuthorize: { type: "", userId: [] },
            timer2: null,
            authTimer: null
        };
    },
    components: {
        people,
        pageInation,
        permIssion,
        // dataPermisson
    },
    computed: {
        user() {
            return JSON.parse(sessionStorage.getItem("user") || "{}");
        },
        // 设置只有在项目部的时候才会显示这些
        // userNum() {
        //     let data = sessionStorage.getItem("user"); //
        //     data = JSON.parse(data);
        //     return data.fkOrgId; // 设置那个编辑里面的项目集合
        // },
        // orgType() {
        //     let data = sessionStorage.getItem("user"); //
        //     data = JSON.parse(data);
        //     return data.orgType;
        // }
    },

    mounted() {

        // this.getItemList();
    },
    methods: {
        closeCheckDialog() {
            this.$emit("update:show", false);

        },
        selectUser(item) {
            console.log(item)
            this.$emit('selectConfirmation', item)
        },
        getAllCanViewMenu() {
            this.$api.getAllCanViewMenu().then(res => {
                if (res.code === 200) {
                    this.treeData3 = res.data
                } else {
                    this.$message.warning(res.msg)
                }
            })
        },

        // 员工信息
        peopleInfo(data) {
            // 清空对象
            Object.keys(this.form).forEach(key => {
                if (this.form[key] instanceof Array) {
                    this.form[key] = [];
                } else {
                    this.form[key] = "";
                }
            });
            console.log(data);
            if (data.deptName != null) {
                this.form.userId = "";
                this.form.deptId = data.pkId;
            } else {
                this.form.deptId = "";
                this.form.userId = data.pkId;
            }
            this.getData();
        },
        dianjiwa() {
            this.form.userId = "";
            this.form.deptId = "";
            this.getData();
        },
        // 获取数据的方法
        getData() {
            const params = {
                pageNum: this.pageNum,
                pageSize: this.pageSize,
                orgId: this.userNum
            };
            const obj = { ...params, ...this.form };
            this.loading = true;
            //    userName: "",
            // sex: "",
            // telephone: ""
            obj.userName = this.userName;
            obj.sex = this.sex;
            obj.telephone = this.telephone;
            obj.fkSealId = this.fkSealId
            if (this.user.orgType == 0) {
                // 运营商
                this.$api
                    .operationSearchPageByUser(obj)
                    .then(res => {
                        if (res.code === 200) {
                            this.tableData = res.data.records;
                            this.total = res.data.total - 0;
                            this.loading = false;
                            this.$refs.tables.bodyWrapper.scrollTo(0, 0);
                        } else {
                            this.loading = false;
                            this.$message.warning(res.msg);
                        }
                    })
                    .catch(err => {
                        this.loading = false;
                    });
            } else {
                // 客户端
                this.$api
                    .searchPageByUser(obj)
                    .then(res => {
                        if (res.code === 200) {
                            this.tableData = res.data.records;
                            this.total = res.data.total - 0;
                            this.loading = false;
                            this.$refs.tables.bodyWrapper.scrollTo(0, 0);
                        } else {
                            this.loading = false;
                            this.$message.warning(res.msg);
                        }
                    })
                    .catch(err => {
                        this.loading = false;
                    });
            }
        },
        // 查询树形员工结构
        getAllDeptAndStaff() {
            //             allDeptAndUser: (params
            //  operationAllDeptAndUser
            if (this.user.orgType == 0) {
                this.$api.operationAllDeptAndUser().then(res => {
                    if (res.code === 200) {
                        // 树形员工集合
                        this.dataStaff = res.data.children;
                        this.company = res.data.aliasName;
                        this.companyId = res.data.pkId;
                    } else {
                        this.$message.warning(res.msg);
                    }
                });
            } else {
                this.$api.allDeptAndUser().then(res => {
                    if (res.code === 200) {
                        // 树形员工集合
                        this.dataStaff = res.data.children;
                        this.company = res.data.orgName;
                        this.companyId = res.data.pkId;
                    } else {
                        this.$message.warning(res.msg);
                    }
                });
            }

        },

        // 弹窗取消按钮
        callOff() {
            // this.popup = false;
        },
        // 获取部门
        getDepartment() {
            if (this.user.orgType == 0) {
                // 运营商
                this.$api.operationSearchDept().then(res => {
                    if (res.code == 200) {
                        this.options = [...this.options, ...res.data];
                    } else {
                        this.$message.error(res.msg)
                    }
                });
            } else {
                // 客户端
                this.$api.searchDept().then(res => {
                    if (res.code == 200) {
                        this.options = [...this.options, ...res.data];
                    } else {
                        this.$message.error(res.msg)
                    }
                });
            }

        },
        // 获取角色
        getRoles() {
            if (this.user.orgType == 0) {
                // 运营商
                this.$api.operationSearchRole().then(res => {
                    if (res.code == 200) {
                        this.roleList = [...this.roleList, ...res.data];
                    }
                });
            } else {
                // 客户端
                this.$api.searchRole().then(res => {
                    if (res.code == 200) {
                        this.roleList = [...this.roleList, ...res.data];
                    }
                });
            }

        },
        // 根据用户获取菜单权限列表
        // async getPore() {
        //     await this.$api
        //         .getMenuPermissionListByUser()
        //         .then(res => {
        //             if (res.code === 200) {
        //                 res.data.sysMenuListPc.forEach(item => {
        //                     item.disabled = true;
        //                     item.children.forEach(i => {
        //                         i.disabled = true;
        //                         i.children.forEach(e => {
        //                             e.disabled = true;
        //                         });
        //                     });
        //                 });
        //                 res.data.sysMenuListApp.forEach(item => {
        //                     item.disabled = true;
        //                     item.children.forEach(i => {
        //                         i.disabled = true;
        //                         i.children.forEach(e => {
        //                             e.disabled = true;
        //                         });
        //                     });
        //                 });
        //                 this.treeData = res.data.sysMenuListPc;
        //                 this.treeData2 = res.data.sysMenuListApp;
        //             } else {
        //                 this.$message.warning(res.msg);
        //             }
        //         })
        //         .catch(err => { });
        // },

        // getUserAuthorizeByRoleId(arr) {
        //     this.$api.getUserAuthorizeByRoleId({ roleIds: arr.join(",") }).then(res => {
        //         if (res.code === 200) {
        //             this.selectTree3 = res.data.viewAuthorize
        //             console.log(this.selectTree3);
        //             this.manageAuthorize = res.data.manageAuthorize
        //         }
        //     })
        // },
        removeTag(e) {
            // console.log("移除时触发",e);
        },
        // 外面搜索按钮
        searchData() {
            this.pageNum = 1;
            this.form.deptId = this.form.fkDeptId;
            // this.form.fkRoleId = this.addRoleIdList;
            this.getData();
        },
        // 选择每页多少条
        handleSizeChange(data) {
            this.pageSize = data;
            this.getData();
        },
        // 点击那一页
        handleCurrentChange(data) {
            Object.keys(this.form).forEach(key => {
                if (this.form[key] instanceof Array) {
                    this.form[key] = [];
                } else {
                    this.form[key] = "";
                }
            });
            this.pageNum = data;
            this.getData();
        },
        iteration(data) {
            for (let j = 0; j < data.length; j++) {
                data[j].disabled = true;
                if (data[j].children != undefined && data[j].children.length > 0) {
                    this.iteration(data[j].children);
                }
            }
        },
        // 校验账号是否唯一
        checkReferenced() {
            this.$api.checkReferenced({ loginName: this.form.loginName }).then(res => {
                if (res.data == true) {
                } else {
                    this.form.loginName = "";
                    this.$message({
                        type: "error",
                        message: "此系统账号已存在"
                    });
                }
            });
        },
        // 获取个人信息(当修改的账号为当前登录用户时使用)
        getUserInfo() {
            this.$api.getPersonInfo().then(res => {
                if (res.code === 200) {
                    this.$store.commit("setUserinfo", res.data);
                } else {
                    this.$message.warning(res.msg);
                }
            });
        },
        // // 获取管理项目
        // getItemList() {
        //     this.$api.getItemList().then(res => {
        //         if (res.code === 200) {
        //             this.itemList = res.data;
        //         } else {
        //             this.$message.warning(res.msg);
        //         }
        //     });
        // }
    }
};
</script>
  
<style lang="scss" scoped>
.wraper {
    border: 1px solid #333333;
    width: 100%;
    height: 100%;
}

.form-data {
    display: flex;
    align-items: center;
}

.manage {
    height: 100%;
    display: flex;
}

.people {
    width: 15%;
    height: 99%;
    padding: 25px 0 25px 20px;
    // padding: 20px 60px 0 20px;
    // padding-left: 20px;
    // border: 1px solid #ebeef5;
    background-color: #fff;
    border-radius: 5px;
    font-size: 13px;
}

.sheet {
    flex: 1;
    margin-left: 10px;
    background-color: #fff;
    height: 96%;
    border-radius: 5px;
}

.form-input {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
}

.form-flex {
    display: flex;
}

.sech-form {
    // background-color: #f3f3f3;
    margin-bottom: 10px;
    padding: 0 10px;
    display: flex;
    flex-wrap: wrap;
}

/deep/.el-form-item {
    margin-bottom: 0;
}

.seek {
    margin-left: 20px;
    height: 28px;
}

.add-staff {
    position: absolute;
    right: 40px;
}

/deep/ .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
    border-color: #4080ff;
}

.dianjiwa {
    font-size: 14px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.dianjiwa:hover {
    cursor: pointer;
}

/deep/.el-table {
    height: 600px;
}

.wh-180 {
    width: 180px;
}

/deep/.el-select {
    .el-tag {
        max-width: 100px;
        overflow: hidden;
        white-space: nowrap;
        /*禁⽌换⾏*/
        text-overflow: ellipsis;
        /*省略号*/
    }
}

.edit-title {
    margin-left: 60px;
}

.spacing {
    display: block;
    margin: 0 auto 15px;
}

/deep/ .el-select__tags-text {
    max-width: 40px;
}

.data-authority {
    // margin-left: 30px;
    height: 400px;
    border: 1px solid #ccc;
    padding: 20px;
    padding-top: 5px;

    .authority-title {
        font-size: 16px;
        font-weight: 600;
    }

    .authority-box {
        padding-left: 50px;

        .authority-item {
            line-height: 30px;
        }
    }
}

.permIssion-box {
    padding-left: 22px;
}

/deep/ .el-tabs__header {

    margin: 0 20px !important;
}

.search-bgc {
    margin-top: 23px;
}
.forbidden{
    background: #c8c8c8 !important;
    border-color:#c8c8c8 !important ;
    color: #000 !important;
}
</style>
  