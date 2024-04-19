<template>
  <div class="app-container">
    <!-- 头部搜索 -->
    <div class="search-bar-box" style="position: relative;" v-if="type == 1">
      <span>印章类型</span>
      <el-select v-model="sealType" placeholder="" size="mini" class="wh-200">
        <el-option label="全部" value=""></el-option>
        <el-option v-for="(item, index) in typeList" :key="index" :label="item.sealTypeName" :value="item.sealType"></el-option>
      </el-select>
      <el-button type="primary" size="mini" icon="el-icon-search" class="ml-20 el-button-primary" @click="searchData">查询</el-button>
    </div>
    <div class="tab-container" v-if="type == 1">
      <div class="table-data" style="height:  82%;">
        <el-table :data="tableData" ref="tables" stripe height="98%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
          <el-table-column label="序号" width="60" align="center" type="index">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (pageNum - 1) * pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="roleName" label="印章" width="260" align="center">
            <template slot-scope="{ row }">
              <el-avatar shape="square" :size="100" fit="fill" :src="row.sealUrl"></el-avatar>
            </template>
          </el-table-column>
          <el-table-column prop="sealName" label="印章名称" width="180" align="center"> </el-table-column>
          <el-table-column prop="sealCode" label="印章编号" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="sealSource" label="印章来源" align="center" show-overflow-tooltip></el-table-column>
          <el-table-column prop="sealTypeName" label="印章类型" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="enableStatus" label="状态" align="center">
            <template slot-scope="{ row }">
              <span v-if="row.enableStatus == 0">已禁用</span>
              <span v-if="row.enableStatus == 1">已启用</span>
            </template>
          </el-table-column>
          <el-table-column prop="sealNumber" label="授权数量" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="操作" width="300" align="center">
            <template slot-scope="{ row }">
              <el-button size="mini" plain type="primary" @click="addItem(row)">新增授权</el-button>
              <el-button size="mini" plain @click="lookOver(row)">查看授权</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <!-- 分页 -->
      <tablePaging :currentPage="pageNum" :pageSize="pageSize" :total="total" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></tablePaging>
    </div>
    <unnamed :type="unnamedType" @resh="resh" v-else></unnamed>
    <!-- 新增编辑 -->
    <el-dialog :close-on-press-escape="false" :title="title" width="400px" :visible.sync="popup" @close="closePopup" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <el-form :model="form" style="padding: 12px;">
        <el-form-item label="员工选择" :label-width="formLabelWidth">
          <el-input v-model="form.userName" size="mini" disabled>
            <el-button v-if="!formStatus" slot="append" icon="el-icon-user-solid" @click="show = true"></el-button>
          </el-input>
        </el-form-item>
        <el-form-item label="印章类型" :label-width="formLabelWidth">
          <el-input v-model="form.sealType" size="mini" disabled></el-input>
          <!-- <el-select v-model="form.sealType" placeholder="" :disabled="formStatus" size="mini" @change="sealTypeChange"
            style="width: 100%;">
            <el-option v-for="(item, index) in typeList" :key="index" :label="item.sealTypeName"
              :value="item.sealType"></el-option>
          </el-select> -->
        </el-form-item>
        <el-form-item label="印章名称" :label-width="formLabelWidth">
          <el-input v-model="form.sealName" size="mini" disabled></el-input>
          <!-- <el-select v-model="form.sealName" placeholder="" :disabled="formStatus" size="mini" style="width: 100%;">
            <el-option v-for="(item, index) in sealNameList" :key="index" :label="item.sealName"
              :value="item.sealId"></el-option>
          </el-select> -->
        </el-form-item>
        <el-form-item label="开始日期" :label-width="formLabelWidth">
          <el-date-picker value-format="yyyy-MM-dd" size="mini" v-model="form.beginTime" type="date" :picker-options="pickerOptions" style="width: 100%;" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束日期" :label-width="formLabelWidth">
          <el-date-picker value-format="yyyy-MM-dd" :picker-options="queryOptionsEnd" size="mini" style="width: 100%;" v-model="form.endTime" type="date" :disabled="form.beginTime ? false : true" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="身份核验" :label-width="formLabelWidth" v-if="!formStatus && accountId.length == 0">
          <!-- <el-input v-model="form.remark" size="mini" :disabled="typeStatus"></el-input> -->
          <div class="codeShow-box">
            <div v-if="!codeShow" class="text">请使用系统APP扫码识别</div>
            <div ref="qrCodes" v-if="!codeShow" class="qrCodes" id="qrCodes"></div>
            <div v-if="!codeShow" class="text">{{ form.userName }}</div>
            <div class="codeShow-btn" v-if="codeShow && !scanningState">
              <i class="el-icon-refresh-right" @click="createCode"></i>
              <div>获取二维码</div>
            </div>
            <div class="codeShow-btn" v-if="codeShow && scanningState">
              <i class="el-icon-check" style="color:#1afa29"></i>
              <div>身份核验成功</div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer" v-if="!typeStatus">
        <el-button size="mini" @click.native="callOff">取 消</el-button>
        <el-button size="mini" type="primary" class="el-button-primary" @click.native="getchekcData">保 存</el-button>
      </span>
    </el-dialog>
    <!-- 选择人员 -->
    <userEdit :show.sync="show" :fkSealId="fkSealId" @selectConfirmation="selectConfirmation"></userEdit>
    <!-- 查看授权 -->
    <el-dialog :close-on-press-escape="false" :title="title" width="90%" :visible.sync="tableShow" @close="closePopup" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <el-table :data="impowerTableList" ref="tables" height="400px" stripe v-loading="loading" :header-cell-style="{ background: '#f1f6ff' }">
        <el-table-column label="序号" width="60" align="center" type="index">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (pageNum - 1) * pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="姓名" width="260" align="center"> </el-table-column>
        <el-table-column prop="beginTime" label="有效持章开始时间" width="180" align="center"> </el-table-column>
        <el-table-column prop="endTime" label="有效持章结束时间" align="center"> </el-table-column>
        <el-table-column prop="effectiveState" label="有效状态" align="center"> </el-table-column>
        <el-table-column prop="createUser" label="设置人" align="center"> </el-table-column>
        <el-table-column prop="createTime" label="设置时间" align="center"> </el-table-column>
        <el-table-column label="操作" width="300" align="center">
          <template slot-scope="{ row }">
            <el-button size="mini" v-if="row.isOperator != 1" plain type="primary" @click="editItem(row)">编辑</el-button>
            <el-button size="mini" v-if="row.isOperator != 1" plain @click="handleDelete(row.pkId)">删除</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <tablePaging :currentPage="viewPageNum" :pageSize="viewPageSize" :total="viewTotal" @handleSizeChange="viewSizeChange" @handleCurrentChange="viewCurrentChange"></tablePaging>
    </el-dialog>
    <!-- 二维码弹框 -->
    <el-dialog top="10vh" class="qr-title" width="30%" :visible="authenticationShow" title="授权验证" :append-to-body="false" :close-on-click-modal="true" :close-on-press-escape="false" v-loading="loading" @close="codeClosure">
      <p class="hint-tit">请使用系统APP或者微信</p>
      <p>扫一扫完成授权验证</p>
      <div ref="qrCode" id="qrCode">
        <div class="codeTime" title="刷新二维码" v-if="refreshCode"></div>
      </div>
      <div class="codeOk" v-if="codeOk">
        <i class="el-icon-circle-check iconColor mb-20"></i>
        <div class="mb-60">扫描成功</div>
        <div>请在手机上根据提示操作</div>
        <el-button type="text" @click="refreshClick">重新加载二维码</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import tablePaging from "../../components/tablePaging.vue";
import unnamed from "./compoments/unnamed.vue";
import userEdit from "./compoments/userEdit.vue";
import navBar from "../layout/components/sidebar/navBar.vue";
import QRCode from "qrcodejs2";
export default {
  name: "seal",
  components: {
    tablePaging,
    unnamed,
    userEdit
  },
  data() {
    return {
      type: 1,
      typeList: [],
      tableData: [],
      popup: false, // 控制弹窗显示隐藏
      form: {
        userName: "",
        sealType: "",
        sealName: "",
        beginTime: "",
        endTime: ""
      },
      formStatus: false,
      title: "新增持章授权",
      formLabelWidth: "80px",
      typeStatus: false, // 输入框状态
      elTableHeight: "",
      pageNum: 1,
      pageSize: 10,
      total: 0,
      sealType: "",
      loading: false,
      queryOptionsEnd: {
        disabledDate: time => {
          if (this.form.beginTime) {
            let d;
            if (typeof this.form.beginTime == "string") {
              d = new Date(this.form.beginTime).getTime();
            } else {
              d = this.form.beginTime.getTime();
            }
            return time.getTime() < d && time.getTime() < Date.now() - 24 * 60 * 60 * 1000;
          }
        }
      },

      show: false,
      tableShow: false,
      unnamedType: "",
      codeShow: true,
      impowerTableList: [],
      itemData: {},
      // sealNameList: [],
      viewLicenseSealId: "",
      viewPageNum: 1,
      viewPageSize: 10,
      viewTotal: 0,
      authenticationShow: false,
      userFaceDistinguishId: "",
      scanningState: false,
      codeOk: false,
      addDataItem: {},
      refreshCode: false,
      accountId: "",
      unique: "",
      fkSealId: "",
      // 新增日期限制
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 24 * 60 * 60 * 1000;
        }
      }
    };
  },

  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  mounted() {
    // 高度调整
    // this.elTableHeight = $(".table-container").height();

    if (this.user.orgType == 0) {
      this.getOrgSealState();
    } else {
      this.getEOrgSealState();
    }
  },
  methods: {
    codeClosure() {
      clearInterval(this.timer);
      this.authenticationShow = false;
      this.codeOk = false;
      // this.clearCodetime();
    },
    resh() {
      this.$nextTick(res => {
        if (this.user.orgType == 0) {
          this.getOrgSealState();
        } else {
          this.getEOrgSealState();
        }
        // navBar.methods.hsas();
        // this.getAuthInfo();
      }, 500);
    },
    // getAuthInfo() {
    //   this.$api.getAuthInfo({ type: 1 }).then(res => {
    //     console.log("xxxxxxxx111111111xxxxxxxxxxxxxx")
    //     console.log(res)
    //     console.log("xxxxxxxx111111111xxxxxxxxxxxxxx")
    //     if (res.code == 200) {
    //       if (res.data.authType == "business") {
    //         if (res.data.certNo == null || res.data.certNo == "") {
    //           // this.realNameVerify = 0;
    //           // sessionStorage.setItem("realNameVerify", 0);
    //           // navBar.data.realNameVerify
    //           this.$store.commit("setRealNameVerify", '0');
    //         } else {
    //           // this.realNameVerify = 1;
    //           // sessionStorage.setItem("realNameVerify", 1);
    //           // navBar.data.realNameVerify
    //           this.$store.commit("setRealNameVerify", '1');
    //         }
    //       } else {
    //         if (res.data.operatorMobile == null || (res.data.operatorMobile == "" && res.data.authType == "personal")) {
    //           // this.realNameVerify = 0;
    //           // sessionStorage.setItem("realNameVerify", 0);
    //           // navBar.data.realNameVerify
    //           this.$store.commit("setRealNameVerify", '0');
    //         } else {
    //           // this.realNameVerify = 1;
    //           // sessionStorage.setItem("realNameVerify", 1);
    //           // navBar.data.realNameVerify
    //           this.$store.commit("setRealNameVerify", '1');
    //         }
    //       }
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });

    // },
    // 印章名称下来获取
    // sealTypeChange(val) {
    //   this.sealNameList = []
    //   this.form.sealName = ""
    //   if (this.user.orgType == 0) {
    //     // 运营商
    //     this.$api.getOperationSealNameByType({ sealType: val }).then(res => {
    //       if (res.code == 200) {
    //         this.sealNameList = res.data
    //       } else {
    //         this.$message.error(res.msg)
    //       }
    //     })
    //   } else {
    //     // 客户端
    //     this.$api.getSealNameByType({ sealType: val }).then(res => {
    //       if (res.code == 200) {
    //         this.sealNameList = res.data
    //       } else {
    //         this.$message.error(res.msg)
    //       }
    //     })
    //   }
    // },
    createCode() {
      if (this.itemData.pkId == unnamed || this.itemData.pkId == null || this.itemData.pkId.length == 0) {
        return this.$message.warning("请选择员工");
      }
      this.codeShow = false;
      // const url = localStorage.getItem("httpurl");

      const location = window.location.origin;
      // const location = "http://192.168.2.16";
      this.$nextTick(() => {
        this.$refs.qrCodes.innerHTML = "";
        if (this.user.orgType == 0) {
          // 运营商
          // &unique=${this.unique} 已扫码状态
          this.$api.getTwoCode({ userId: this.itemData.pkId }).then(res => {
            if (res.code === 200) {
              this.userFaceDistinguishId = res.data.faceSwipingVo.userFaceDistinguishId;
              let text = `${location}/h5/#/pages/h5/scanCodeTran?type=6&userFaceDistinguishId=${this.userFaceDistinguishId}`;
              if (res.data.faceSwipingVo.faceSwipingUrl) {
                const data = JSON.stringify(encodeURIComponent(res.data.faceSwipingVo.faceSwipingUrl));
                text += `&data=${data}`;
              } else {
                text += `&userId=${this.itemData.pkId}`;
              }
              this.$api.addQRCode().then(status => {
                text += `&unique=${status.data}`;
                this.unique = status.data;
                this.queryQRCode();
                new QRCode("qrCodes", {
                  width: 190,
                  height: 190,
                  text: text
                });
                this.timerTask();
              });
            } else {
              this.$message.error(res.msg);
            }
          });
        } else {
          // 客户端
          this.$api.getTwoCode({ userId: this.itemData.pkId }).then(res => {
            if (res.code === 200) {
              this.userFaceDistinguishId = res.data.faceSwipingVo.userFaceDistinguishId;
              let text = `${location}/h5/#/pages/h5/scanCodeTran?type=6&userFaceDistinguishId=${this.userFaceDistinguishId}`;
              if (res.data.faceSwipingVo.faceSwipingUrl) {
                const data = JSON.stringify(encodeURIComponent(res.data.faceSwipingVo.faceSwipingUrl));
                text += `&data=${data}`;
              } else {
                text += `&userId=${this.itemData.pkId}`;
              }
              new QRCode("qrCodes", {
                width: 200,
                height: 200,
                text: text
              });
              this.timerTask();
            } else {
              this.$message.error(res.msg);
            }
          });
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
    // 二维码
    //     getQrcode() {
    //   this.loading = false;
    //   const location = window.location.origin;
    //   this.$nextTick(res => {
    //     this.$api.addQRCode().then(res => {
    //       if (res.code === 200) {
    //         this.unique = res.data;
    //         const data = JSON.stringify(encodeURIComponent(this.authenticationUrl));
    //         new QRCode("qrCode", {
    //           width: 260,
    //           height: 260,
    //           correctLevel : 3,
    //           text:`${location}/h5/#/pages/h5/scanCodeTran?type=3&unique=${this.unique}&data=${data}`
    //         });
    //         this.queryQRCode();
    //       } else {
    //         this.$message.warning(res.msg);
    //       }
    //     });
    //     // this.$refs.qrCode.innerHTML = "";

    //   });
    // },

    timerTask() {
      this.timer = setInterval(() => {
        this.$api
          .userFaceDistinguishState({ pkId: this.userFaceDistinguishId, distinguishType: 0 })
          .then(res => {
            if (res.code == 200) {
              this.stopTime = this.stopTime + 3;

              if (res.data.status == 2) {
                clearInterval(this.timer);
                this.$refs.qrCodes.innerHTML = "";
                this.codeShow = true;
                this.scanningState = true;
              } else if (res.data.status == 3) {
                clearInterval(this.timer);
              }
            } else {
              clearInterval(this.timer);
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            clearInterval(this.timer);
          });
      }, 3000);
    },
    // 运营商
    getOrgSealState() {
      this.$api.getOrgSealState().then(res => {
        if (res.code == 200) {
          if (res.data == 0) {
            this.type = 2;
            this.unnamedType = 1;
          } else if (res.data == 2) {
            this.unnamedType = 2;
            this.type = 2;
          } else {
            this.type = 1;
            this.getData();
            this.searchSealType();
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 客户端
    getEOrgSealState() {
      this.$api.getEOrgSealState().then(res => {
        if (res.code == 200) {
          if (res.data == 0) {
            this.type = 2;
            this.unnamedType = 1;
          } else if (res.data == 2) {
            this.unnamedType = 2;
            this.type = 2;
          } else {
            this.type = 1;
            this.getData();
            this.searchSealType();
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 获取印章类型
    searchSealType() {
      if (this.user.orgType == 0) {
        // 运营商
        this.$api.operationSearchSealType().then(res => {
          if (res.code == 200) {
            this.typeList = res.data;
          }
        });
      } else {
        // 客户端
        this.$api.searchSealType().then(res => {
          if (res.code == 200) {
            this.typeList = res.data;
          }
        });
      }
    },
    selectConfirmation(item) {
      console.log("xxxxxxxxxxxxxxxxxxxxxx");
      console.log(item);
      this.itemData = item;
      this.accountId = item.accountId == null ? "" : item.accountId;
      this.form.userName = item.userName;
      console.log("xxxxxxxxxxxxxxxxxxxxxx");
      this.show = false;
    },
    // 新增
    addItem(item) {
      this.fkSealId = item.pkId;
      this.accountId = "";
      this.addDataItem = item;
      this.scanningState = false;
      this.title = "新增持章授权";
      this.formStatus = false;
      this.codeShow = true;
      this.itemData = {};
      this.form = {
        userName: "",
        sealType: item.sealTypeName,
        sealName: item.sealName,
        beginTime: "",
        endTime: ""
      };
      this.popup = true;
    },
    // 编辑
    editItem(item) {
      this.title = "编辑持章授权";
      this.accountId = "";
      this.formStatus = true;
      this.popup = true;
      if (this.user.orgType == 0) {
        this.$api.operationHoldSealFindById({ pkId: item.pkId }).then(res => {
          if (res.code == 200) {
            this.form.userName = res.data.userName;
            this.form.sealType = res.data.sealType;
            this.form.sealName = res.data.sealName;
            this.form.beginTime = res.data.beginTime;
            this.form.endTime = res.data.endTime;
          } else {
            this.$message.error(res.msg);
          }
        });
      } else {
        this.$api.holdSealFindById({ pkId: item.pkId }).then(res => {
          if (res.code == 200) {
            this.form.userName = res.data.userName;
            this.form.sealType = res.data.sealType;
            this.form.sealName = res.data.sealName;
            this.form.beginTime = res.data.beginTime;
            this.form.endTime = res.data.endTime;
            this.form.pkId = res.data.pkId;
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    },

    // 查看
    lookOver(item) {
      this.title = "查看授权-" + item.sealName;
      this.tableShow = true;
      this.viewLicenseSealId = item.pkId;
      this.viewLicenseSeal();
    },
    // 选择每页多少条
    viewSizeChange(data) {
      this.viewPageSize = data;
      this.viewLicenseSeal();
    },
    // 点击那一页
    viewCurrentChange(data) {
      this.viewPageNum = data;
      this.viewLicenseSeal();
    },
    // 查看授权 -  XX合同专用章
    viewLicenseSeal() {
      let data = {
        pageNum: this.viewPageNum,
        pageSize: this.viewPageSize,
        fkSealId: this.viewLicenseSealId
      };
      if (this.user.orgType == 0) {
        // 运营商
        this.$api.operationUserSealSearchPage(data).then(res => {
          if (res.code == 200) {
            this.impowerTableList = res.data.records;
            this.viewTotal = res.data.total - 0;
          } else {
            this.$message.error(res.msg);
          }
        });
      } else {
        // 客户端
        this.$api.userSealSearchPage(data).then(res => {
          if (res.code == 200) {
            this.impowerTableList = res.data.records;
            this.viewTotal = res.data.total - 0;
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    },
    // 删除
    handleDelete(id) {
      this.$confirm("确定删除该印章授权信息？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.loading = true;
          if (this.user.orgType == 0) {
            // 运营商删除
            this.$api
              .operationHoldSealDelete({ pkId: id })
              .then(res => {
                this.loading = false;
                if (res.code === 200) {
                  this.$message.success("删除成功");
                  this.viewLicenseSeal();
                } else {
                  this.$message.error(res.msg);
                }
              })
              .catch(err => {
                this.loading = false;
                this.$message.error(err);
              });
          } else {
            // 客户端删除
            this.$api
              .holdSealDelete({ pkId: id })
              .then(res => {
                this.loading = false;
                if (res.code === 200) {
                  this.$message.success("删除成功");
                  this.viewLicenseSeal();
                } else {
                  this.$message.error(res.msg);
                }
              })
              .catch(err => {
                this.loading = false;
                this.$message.error(err);
              });
          }
        })
        .catch(error => {
          this.loading = false;
        });
    },
    refreshClick() {
      this.codeOk = false;
      clearInterval(this.timer);
      clearInterval(this.codeTimer);
      this.getchekcData();
    },
    // 弹窗的保存
    getchekcData() {
      this.loading = true;
      if (this.title == "编辑持章授权") {
        // 编辑
        this.editSubmit();
      } else {
        if (this.scanningState == false && this.accountId.length == 0) {
          this.loading = false;
          return this.$message.error("请先进行身份核验");
        }
        // 新增
        this.addSubmit();
      }
      //     holdSealUpdate: (data = {}) => httpPost({ url: "/eng/holdSeal/update", data }), // 客户端编辑持章授权
      // operationHoldSealUpdate: (data = {}) => httpPost({ url: "/operation/holdSeal/update", data }), // 运营商编辑持章授权

      // holdSealAdd: (data = {}) => httpPost({ url: "/eng/holdSeal/add", data }), // 客户端新增持章授权
      // operationHoldSealAdd: (data = {}) => httpPost({ url: "/operation/holdSeal/add", data }) // 运营商新增持章授权
    },
    editSubmit() {
      let data = {
        beginTime: this.form.beginTime + " 00:00:00",
        endTime: this.form.endTime + " 23:59:59",
        pkId: this.form.pkId
      };
      if (this.user.orgType == 0) {
        // 运营商
        this.$api.operationHoldSealUpdate(data).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.loading = false;
            if (res.code == 200) {
              this.authenticationShow = true;
              this.userFaceDistinguishId = res.data.userFaceDistinguishId;
              const url = res.data.authorizationSignShortUrl;
              this.$nextTick(res => {
                this.$refs.qrCode.innerHTML = "";
                new QRCode("qrCode", {
                  width: 260,
                  height: 260,
                  text: url
                });
                this.timerCodeTask();
              });
            } else {
              this.$message.error(res.msg);
            }
          } else {
            this.$message.error(res.msg);
          }
        });
      } else {
        // 客户端
        this.$api.holdSealUpdate(data).then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.loading = false;
            if (res.code == 200) {
              this.authenticationShow = true;
              this.userFaceDistinguishId = res.data.userFaceDistinguishId;
              const url = res.data.authorizationSignShortUrl;
              this.$nextTick(res => {
                this.$refs.qrCode.innerHTML = "";
                new QRCode("qrCode", {
                  width: 260,
                  height: 260,
                  text: url
                });
                this.timerCodeTask();
              });
            } else {
              this.$message.error(res.msg);
            }
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    },
    addSubmit() {
      let data = {
        beginTime: this.form.beginTime + " 00:00:00",
        endTime: this.form.endTime + " 23:59:59",
        fkSealId: this.addDataItem.pkId,
        fkUserId: this.itemData.pkId
        // pkId: this.form.pkId
      };
      // if (this.user.orgType == 0) {
      //   // 运营商

      //   this.$api.operationHoldSealAdd(data).then(res => {
      //     this.loading = false
      //     if (res.code == 200) {
      //       this.authenticationShow = true
      //       this.userFaceDistinguishId = res.data.userFaceDistinguishId
      //       const url = res.data.authorizationSignShortUrl
      //       this.$nextTick(res => {
      //         this.$refs.qrCode.innerHTML = "";
      //         new QRCode("qrCode", {
      //           width: 260,
      //           height: 260,
      //           text: url
      //         });
      //         this.timerCodeTask();
      //       })
      //     } else {
      //       this.$message.error(res.msg)
      //     }
      //   })
      // } else {
      //   // 客户端
      //   this.$api.holdSealAdd(data).then(res => {
      //     this.loading = false
      //     if (res.code == 200) {
      //       this.authenticationShow = true
      //       this.userFaceDistinguishId = res.data.userFaceDistinguishId
      //       const url = res.data.authorizationSignShortUrl
      //       this.$nextTick(res => {
      //         this.$refs.qrCode.innerHTML = "";
      //         new QRCode("qrCode", {
      //           width: 260,
      //           height: 260,
      //           text: url
      //         });
      //         this.timerCodeTask();
      //       })
      //     } else {
      //       this.$message.error(res.msg)
      //     }
      //   })
      // }
      const location = window.location.origin;
      this.authenticationShow = true;
      this.$nextTick(() => {
        this.$refs.qrCode.innerHTML = "";
        if (this.user.orgType == 0) {
          // 运营商
          // &unique=${this.unique} 已扫码状态
          this.$api.operationHoldSealAdd(data).then(res => {
            if (res.code === 200) {
              this.userFaceDistinguishId = res.data.userFaceDistinguishId;
              let text = `${location}/h5/#/pages/h5/scanCodeTran?type=2&userFaceDistinguishId=${this.userFaceDistinguishId}`;
              if (res.data.authorizationSignShortUrl) {
                const data = JSON.stringify(encodeURIComponent(res.data.authorizationSignShortUrl));
                text += `&data=${data}`;
              } else {
                text += `&userId=${this.itemData.pkId}`;
              }
              this.$api.addQRCode().then(status => {
                text += `&unique=${status.data}`;
                this.unique = status.data;
                this.queryQRCode();
                // queryQRCode
                new QRCode("qrCode", {
                  width: 190,
                  height: 190,
                  text: text
                });
                this.timerCodeTask();
              });
            } else {
              this.$message.error(res.msg);
            }
          });
        } else {
          // 客户端
          this.$api.holdSealAdd(data).then(res => {
            if (res.code === 200) {
              this.loading = false;
              this.userFaceDistinguishId = res.data.userFaceDistinguishId;
              let text = `${location}/h5/#/pages/h5/scanCodeTran?type=2&userFaceDistinguishId=${this.userFaceDistinguishId}`;
              if (res.data.authorizationSignShortUrl) {
                const data = JSON.stringify(encodeURIComponent(res.data.authorizationSignShortUrl));
                text += `&data=${data}`;
              } else {
                text += `&userId=${this.itemData.pkId}`;
              }
              // new QRCode("qrCode", {
              //   width: 200,
              //   height: 200,
              //   text: text

              // });
              // this.timerCodeTask();
              this.$api.addQRCode().then(status => {
                text += `&unique=${status.data}`;
                this.unique = status.data;
                this.queryQRCode();
                // queryQRCode
                new QRCode("qrCode", {
                  width: 190,
                  height: 190,
                  text: text
                });
                this.timerCodeTask();
              });
            } else {
              this.authenticationShow = false;
              clearInterval(this.timer);
              this.loading = false;
              this.$message.error(res.msg);
            }
          });
        }
      });
    },
    timerCodeTask() {
      this.timer = setInterval(() => {
        this.$api
          .userFaceDistinguishState({ pkId: this.userFaceDistinguishId, distinguishType: 0 })
          .then(res => {
            if (res.code == 200) {
              this.stopTime = this.stopTime + 3;
              if (res.data.status == 2) {
                clearInterval(this.timer);
                this.authenticationShow = false;
                this.popup = false;
                if (this.title == "编辑持章授权") {
                  this.viewLicenseSeal();
                }
                this.getData();
                this.$message.success("授权成功");
              } else if (res.data.status == 3) {
                clearInterval(this.timer);
              }
            } else {
              clearInterval(this.timer);
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            clearInterval(this.timer);
          });
      }, 3000);
    },
    // 弹窗取消按钮
    callOff() {
      this.popup = false;
    },
    // 获取数据的方法
    getData() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        sealType: this.sealType
      };
      this.loading = true;
      if (this.user.orgType == 0) {
        // 运营商
        this.$api.operationOrgSealSearchPage(params).then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            if (this.type == 1) {
              this.$refs.tables.bodyWrapper.scrollTo(0, 0);
            }
          } else {
            this.$message.warning(res.msg);
          }
        });
      } else {
        // 客户端
        this.$api.orgSealSearchPage(params).then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            if (this.type == 1) {
              this.$refs.tables.bodyWrapper.scrollTo(0, 0);
            }
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },

    closePopup() {
      this.form = {
        userName: "",
        sealType: "",
        sealName: "",
        beginTime: "",
        endTime: ""
      };
      // this.tableShow = false
      // tableShow
    },

    // 外面搜索按钮
    searchData() {
      this.pageNum = 1;
      this.getData();
    },
    // 选择每页多少条
    handleSizeChange(data) {
      this.pageSize = data;
      this.getData();
    },
    // 点击那一页
    handleCurrentChange(data) {
      this.pageNum = data;
      this.getData();
    }
  }
};
</script>

<style lang="scss" scoped>
.form-input {
  display: flex;
}

.add-department {
  margin: 10px 20px;
}

/deep/ .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner {
  background-color: #409eff !important;
  border-color: #409eff !important;
}

/deep/ .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
  border-color: #ffffff;
}

.edit-title {
  margin-left: 60px;
}

.search-mr {
  font-size: 14px;
}

.permIssion-box {
  padding-left: 22px;
}

/deep/ .el-tabs__header {
  margin: 0 20px !important;
}

.sech-form {
  background-color: $searcHeder;
  margin-bottom: 5px;
  padding: 0 5px;
  display: flex;
  margin-top: 10px;

  // justify-content: space-between;
  /deep/ .el-form-item {
    margin-bottom: 0;
  }
}

.codeShow-box {
  background: #f2f2f2;
  height: 280px;
  text-align: center;
  // padding-top: 10px;

  .qrCodes {
    width: 210px;
    margin: 0 auto;
    padding: 6px;
    background: #fff;
  }

  .codeShow-btn {
    padding-top: 80px;

    .el-icon-refresh-right {
      color: #000;
      font-size: 50px;
      font-weight: 500;
    }

    .el-icon-check {
      font-size: 40px;
      font-weight: 400;
    }
  }

  .text {
    line-height: 28px;
  }
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

  #qrCodes {
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
    position: relative;

    p {
      color: #3aa1ff;
    }
  }
}
.codeOk {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 286px;
  height: 282px;
  top: 122px;
  left: 148px;
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
</style>
