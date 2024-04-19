<template>
  <div class="app-container">
    <!-- 头部搜索 -->
    <div class="search-bgc search-mr">
      <el-form :model="searchData" class="form-data">
        <el-form-item label="标段项目" label-width="80px">
          <el-select v-model="searchData.fkBidProjectId" size="mini">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in noProjectData" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" label-width="60px">
          <el-select v-model="searchData.purchaseCode" size="mini" class="wh-100">
            <el-option label="全部" value=""></el-option>
            <el-option label="草稿" value="0" v-if="![2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)"></el-option>
            <el-option label="待确认" value="1"></el-option>
            <el-option label="已确认" value="2"></el-option>
            <el-option label="已驳回" value="3"></el-option>
            <el-option label="已完成" value="4"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="单据日期" label-width="90px">
          <el-date-picker size="mini" class="wh-120" value-format="yyyy-MM-dd" v-model="searchData.beginTime"></el-date-picker>
          <span>至</span>
          <el-date-picker size="mini" class="wh-120" value-format="yyyy-MM-dd" v-model="searchData.endTime"></el-date-picker>
        </el-form-item>
        <el-form-item label="单据编号" label-width="90px">
          <el-input v-model="searchData.orderCode" size="mini" maxlength="100"></el-input>
        </el-form-item>
        <el-button size="mini" type="primary" class="seek" icon="el-icon-search" @click="queryData">查询</el-button>
        <el-button type="primary" size="mini" class="add-staff" @click="addRecord" v-if="user.orgType == 5">新增采购计划单</el-button>
      </el-form>
    </div>
    <div class="tab-container">
      <div class="table-data" style="height:75%">
        <el-table :data="tableData" v-loading="loading" height="100%" :header-cell-style="{ background: '#f1f6ff' }" ref="tableBox" :tooltip-effect="'light'">
          <el-table-column label="序号" width="60" align="center">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (pageNum - 1) * pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="orderCode" label="单据编号" align="center"> </el-table-column>
          <el-table-column prop="projectBidName" label="标段项目" align="center"> </el-table-column>
          <el-table-column prop="rePurchaseApplies" label="关联物资申请单" align="center"> </el-table-column>
          <el-table-column prop="createUserName" label="填表人" align="center"> </el-table-column>
          <el-table-column prop="serviceTime" label="单据时间" align="center"> </el-table-column>
          <el-table-column prop="confirmUserName" label="确认人" align="center"> </el-table-column>
          <el-table-column prop="confirmTime" label="确认时间" align="center"> </el-table-column>
          <el-table-column label="状态" prop="purchaseCodeName" align="center"> </el-table-column>
          <el-table-column prop="remark" label="备注" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="操作" align="center" width="200">
            <template slot-scope="{ row }">
              <el-button size="mini" plain type="primary" @click="lookOver(row, 1)" v-has="'supplies:plannedOrder:query'">查看</el-button>
              <el-button size="mini" plain type="success" @click="lookOver(row, 3)" v-if="row.isHandle" v-has="'supplies:plannedOrder:handle'">处理</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <!-- 分页 -->
      <pageInation :currentPage="pageNum" :pageSize="pageSize" :total="total" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></pageInation>
    </div>
    <!-- 弹窗 -->
    <el-dialog :close-on-press-escape="false" :title="title" :visible="popup" width="60%" v-dialogDrag :close-on-click-modal="false" v-loading="loading" @close="close" top="3vw">
      <div class="dialog-form">
        <el-radio-group v-model="isCollapse" size="mini" v-if="form.purchaseCodeName == '已完成' || form.purchaseCodeName == '已确认'">
          <el-radio-button :label="0">基本信息</el-radio-button>
          <el-radio-button :label="1">关联出库单</el-radio-button>
        </el-radio-group>
        <div class="tab-two" v-show="isCollapse == 0">
          <el-form :model="form" :rules="rules" ref="form" class="row-height">
            <el-row :span="24" class="el-row-data">
              <el-col :span="8">
                <el-form-item label="采购计划单号" prop="orderCode" label-width="120px">
                  <el-input v-model="form.orderCode" size="mini" :disabled="btnStatus"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="标段项目" prop="orderCode" label-width="120px">
                  <el-input v-model="form.projectBidName" size="mini" :disabled="btnStatus"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="关联物资申请单" label-width="140px">
                  <!-- 启用远程搜索，需要设置 filterable 和 remote -->
                  <el-select size="mini" collapse-tags multiple filterable remote :remote-method="remoteMethod" value-key="pkId" @visible-change="restoreSelect" reserve-keyword v-model="form.rePurchaseApplies" class="wh" :disabled="btnStatus" :loading="loading2" v-if="num == 0">
                    <el-option v-for="item in applicationData" :key="item.pkId" :label="item.orderCode" :value="item"></el-option>
                  </el-select>
                  <el-tooltip class="item" effect="light" placement="bottom-start" v-else>
                    <div slot="content">
                      <div>{{ form.rePurchaseApplies }}</div>
                    </div>
                    <div class="tree-box">
                      <span>{{ form.rePurchaseApplies }}</span>
                    </div>
                  </el-tooltip>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="btnStatus || num == 2">
                <el-form-item label="填表人" prop="leaderName" label-width="120px">
                  <el-input v-model="form.leaderName" size="mini" :disabled="btnStatus"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="业务时间" label-width="110px">
                  <el-date-picker size="mini" class="time-wh" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" v-model="form.serviceTime" :disabled="btnStatus"></el-date-picker>
                </el-form-item>
              </el-col>
              <!-- <el-col :span="8" v-if="btnStatus || num == 2">
                <el-form-item label="制单人" label-width="140px">
                  <el-input v-model="form.createUserName" size="mini" :disabled="btnStatus || num == 2"></el-input>
                </el-form-item>
              </el-col> -->
              <el-col :span="8" v-if="title == '采购计划单信息'">
                <el-form-item label="单据时间" label-width="120px">
                  <el-input v-model="form.createTime" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="title == '采购计划单信息'">
                <el-form-item label="单据状态" label-width="110px">
                  <el-input v-model="form.purchaseCodeName" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label-width="120px">
                  <label slot="label">收货地址</label>
                  <el-input v-model="form.receiptAddress" size="mini" :disabled="btnStatus" class="wh" maxlength="100"> </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label-width="120px">
                  <label slot="label">备&emsp;&emsp;注</label>
                  <el-input type="textarea" resize="none" :autosize="{ minRows: 4, maxRows: 4 }" v-model="form.remark" maxlength="100" class="wh" :disabled="btnStatus"> </el-input>
                </el-form-item>
              </el-col>
              <!-- 确认查看 -->
              <el-col :span="24" v-if="form.purchaseCodeName == '已确认' && title == '采购计划单信息'">
                <div class="affirm">
                  <div>确认人: {{ form.confirmUserName }}</div>
                  <div>确认时间: {{ form.confirmTime }}</div>
                </div>
              </el-col>
              <!-- 驳回查看 -->
              <el-col :span="24" v-if="form.purchaseCodeName == '已驳回' && title == '采购计划单信息'">
                <div class="affirm">
                  <div>
                    驳回人: {{ form.confirmUserName }}
                    <div>驳回原因：{{ form.reason }}</div>
                  </div>
                  <div>驳回时间: {{ form.reasonTime }}</div>
                </div>
              </el-col>
            </el-row>
          </el-form>
          <h3 class="material">物料信息</h3>
          <div class="table1">
            <el-table :data="accessoryList" height="100%" style="width: 100%" :header-cell-style="{ background: '#f1f6ff' }" :key="random">
              <el-table-column label="序号" type="index" width="60" align="center"> </el-table-column>
              <el-table-column label="物料名称" align="center" prop="materialName"> </el-table-column>
              <el-table-column label="物料分类" align="center" prop="materialTypeName"> </el-table-column>
              <el-table-column label="单位" width="80" align="center" prop="unitName"> </el-table-column>
              <el-table-column label="需求数量" align="center" prop="purchaseNum" width="150"> </el-table-column>

              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>
          </div>
        </div>
        <div class="tab-two tableH" v-show="isCollapse == 1">
          <el-table :data="tableBills" height="100%" :header-cell-style="{ background: '#f1f6ff' }">
            <el-table-column prop="date" label="序号" width="60" align="center">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ scope.$index + 1 }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="orderCode" label="出库单据" align="center">
              <template slot-scope="{ row }">
                <span class="blue" @click="orderClick(row, 4)">{{ row.orderCode }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="单据日期" align="center"> </el-table-column>
            <el-table-column prop="warehouseName" label="出库仓库" align="center"> </el-table-column>
            <el-table-column prop="inventoryCode" label="出库状态" align="center"> </el-table-column>
            <el-table-column prop="receiverName" label="出库人" align="center"> </el-table-column>
            <el-table-column prop="receiverTime" label="出库时间" align="center"> </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
        <div slot="footer" class="dialog-footer" v-if="isCollapse == 0 && num != 1">
          <el-button type="primary" class="certainty" @click="modifyState(2)" v-if="num == 3">确认</el-button>
          <el-button type="danger" class="certainty" @click="turnDown" v-if="num == 3">驳回</el-button>
          <el-button type="primary" class="certainty" @click="submit('form', 0)" v-if="num == 0 || num == 2">保存草稿</el-button>
          <el-button type="primary" class="certainty" @click="submit('form', 1)" v-if="num == 0 || num == 2">提交单据</el-button>
          <el-button class="certainty" @click="popup = false" v-if="num != 1">取 消</el-button>
        </div>
      </div>
    </el-dialog>
    <checkOrderDialog :checkOrderDialog.sync="checkOrderDialog" :orderType="orderType" :pkId="orderPkId"></checkOrderDialog>
  </div>
</template>

<script>
import pageInation from "../../components/tablePaging";
import selectTree from "../../components/selectTree/selectTree.vue"; // 引入自定义下拉树形组建
import checkOrderDialog from "./components/checkOrderDialog.vue"; // 查询出入库单信息
export default {
  name: "purchase",
  data() {
    return {
      // 采购类型 purchase_ordinary:普通材料采购,purchase_concrete:混凝土采购,purchase_rebar:钢筋半成品
      purchaseTypeCode: "purchase_ordinary",
      // 搜索数据
      searchData: {
        projectName: "",
        purchaseCode: "",
        beginTime: "",
        endTime: "",
        orderCode: "",
        fkBidProjectId: ""
      },
      options: [],
      options2: [],
      noProjectData: [], // 标段项目
      applicationData: [], // 关联物资申请单
      // 表格列表
      tableData: [],

      popup: false,
      // 分页数据
      pageNum: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      // 新增编辑弹框对象数据
      form: {
        orderCode: "",
        orderApplyMaterialDetails: [],
        purchaseCode: "",
        leaderName: "",
        fkBidProjectId: "", // 标段项目
        rePurchaseApplies: [], // 关联申请单
        inspectName: "",
        serviceTime: "", // 业务时间
        receiptAddress: "",
        remark: "",
        reason: "", // 驳回原因
        confirmUserName: "", // 驳回人
        reasonTime: "", // 驳回时间
        confirmTime: "" // 驳回时间
      },
      title: "",
      rules: {},
      isCollapse: 0, // 控制分包单位查看tab切换状态
      // 物料
      accessoryList: [],
      setProps: {
        value: "pkId",
        label: "typeName",
        children: "childList",
        disabled: "isChoose"
      },
      btnStatus: false, // 按钮是查看还是新增控制输入框状态
      loading2: false,
      tableBills: [],
      materDialog: false, // 控制物料选择
      rowData: {}, // 物料当前行数据
      random: Math.random(),
      num: 1, // 1 查看 2 处理  3 编辑
      checkOrderDialog: false,
      orderType: 4,
      orderPkId: ""
    };
  },
  components: {
    pageInation,
    selectTree,
    checkOrderDialog
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  mounted() {
    this.getData();
    this.getItemListNoUserId();
  },
  methods: {
    orderClick(item, type) {
      this.orderType = type;
      this.orderPkId = item.pkId;
      this.checkOrderDialog = true;
    },
    // 驳回
    turnDown() {
      this.$prompt("请输入驳回原因", "提示", {
        inputType: "textarea",
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(({ value }) => {
          if (value) {
            this.form.reason = value;
          } else {
            this.form.reason = "申请不通过";
          }
          this.modifyState(3);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消"
          });
        });
    },
    // 确认  撤回
    modifyState(num) {
      this.loading = true;
      const params = {
        businessType: num,
        pkId: this.form.pkId,
        reason: this.form.reason
      };
      this.$api.modifyPurchaseOrderState(params).then(res => {
        this.loading = false;
        if (res.code === 200) {
          this.$message.success(res.msg);
          this.popup = false;
          this.getData();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取标段项目
    getItemListNoUserId() {
      this.$api.getItemListNoUserId().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.projectName;
            item.value = item.pkId;
          });

          this.noProjectData = res.data;
        }
      });
    },
    // 获取分页列表
    getData() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize
        // purchaseTypeCode: this.purchaseTypeCode
      };
      const obj = { ...params, ...this.searchData };
      this.loading = true;
      this.$api
        .getPurchaseOrder(obj)
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            this.loading = false;
          } else {
            this.loading = false;
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 查看
    lookOver(item, num) {
      this.isCollapse = 0;
      this.num = num;
      this.btnStatus = true;
      this.queryUserinfo(item.pkId);
      this.title = "采购计划单信息";
      this.popup = true;
    },
    // 查询采购单信息
    queryUserinfo(id) {
      this.$api.queryPurchaseOrder({ pkId: id }).then(res => {
        if (res.code == 200) {
          this.form = res.data;
          // 处理编辑情况申请单问题
          // if (res.data.applyIds !== null) {

          //   res.data.applyIds.forEach(element => {

          //   });
          //   this.form.rePurchaseApplies =
          // }

          // 物料信息
          this.accessoryList = res.data.orderApplyMaterialDetails;
          this.tableBills = res.data.relationOutInventoryVos;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 弹窗取消按钮
    callOff() {
      this.popup = false;
    },
    close() {
      this.popup = false;
      this.$refs.form.resetFields();
      this.form.orderApplyMaterialDetails = [];
    },
    // 外面搜索按钮
    queryData() {
      this.pageNum = 1;
      this.getData();
    },
    // 选择每页多少条
    handleSizeChange(data) {
      this.pageSize = data;
      this.getData();
      this.$refs.tableBox.bodyWrapper.scrollTo(0, 0);
    },
    // 点击那一页
    handleCurrentChange(data) {
      this.pageNum = data;
      this.getData();
      this.$refs.tableBox.bodyWrapper.scrollTo(0, 0);
    }
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
  height: 80px;
  background-color: #fff;
  /deep/ .el-form-item {
    margin-bottom: 0 !important;
  }
}
.people {
  width: 15%;
  height: 696px;
  padding: 25px 0 25px 20px;
  // padding: 20px 60px 0 20px;
  // padding-left: 20px;
  border: 1px solid #ebeef5;
  font-size: 13px;
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
  background-color: #f3f3f3;
  margin-bottom: 10px;
  padding: 0 10px;
  display: flex;
  flex-wrap: wrap;
}
.seek {
  margin-left: 20px;
  height: 28px;
}
.add-staff {
  position: absolute;
  right: 40px;
}
// 弹框
/deep/ .el-dialog__header {
  background: #f3f3f3;
}
.wh {
  width: 100%;
}
/deep/ .el-dialog__body {
  margin-top: 20px;
  height: 100%;
  .el-form {
    /deep/ .el-form-item {
      margin-bottom: 16px !important;
    }
  }
}
// 确认人
.affirm {
  margin-left: 80px;
  display: flex;
  justify-content: space-between;
  border: 1px dotted #333333;
  padding: 10px;
}
.material {
  text-align: center;
  margin-bottom: 10px;
}
.table1 {
  height: 300px;
}
.dialog-footer {
  display: flex;
  justify-content: center;

  padding: 14px 0;
  .certainty {
    margin: 0 20px 0 35px;
  }
}
// 设置弹框里面输入框行高
.row-height {
  /deep/ .el-form-item {
    margin-bottom: 10px;
    .el-form-item__error {
      top: 31px;
    }
  }
}
.el-row-data {
  display: flex;
  flex-wrap: wrap;
}
.tree-box {
  position: absolute;
  width: 100%;
  top: 5px;
  font-size: 12px;
  height: 28px;
  line-height: 28px;
  padding-left: 15px;
  overflow-x: auto;
  border: 1px solid #e4e7ed;
  color: #424242;
  background-color: #f6f6f6;
  border-radius: 5px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.tab-two {
  height: 80%;
}
.time-wh {
  width: 100% !important;
}
// 设置弹框高度
// /deep/ .el-dialog {
//   height: 780px;
// }
.blue {
  color: #02aff4;
  cursor: pointer;
}
.tableH {
  height: 620px;
}
</style>
