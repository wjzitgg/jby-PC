<template>
  <div class="app-container">
    <!-- 头部搜索 -->
    <div class="search-bgc search-mr">
      <el-form :model="searchData" class="form-data">
        <el-form-item label="标段项目" label-width="80px" v-if="user.orgType != 5">
          <!-- <el-select v-model="searchData.fkBidProjectId" size="mini" @change="projectIdChange">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in noProjectData" :key="item.value" :label="item.label"
              :value="item.value"></el-option>
          </el-select> -->
          <proSelct @selectIds="selectIds"></proSelct>
        </el-form-item>
        <el-form-item label="供应商" label-width="80px" v-if="typeShow">
          <el-select v-model="searchData.fkCustomerId" size="mini">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" label-width="60px" v-if="typeShow">
          <el-select v-model="searchData.purchaseCode" size="mini" class="wh-100">
            <el-option label="全部" value=""></el-option>
            <el-option label="草稿" value="0" v-if="![2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)"></el-option>
            <el-option label="待确认" value="1"></el-option>
            <el-option label="已确认" value="2"></el-option>
            <el-option label="已驳回" value="3"></el-option>
            <el-option label="已完成" value="4"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="writeTime" :label="user.orgType==5?'单据日期':'申请时间'" label-width="90px" v-if="typeShow">
          <el-date-picker size="mini" class="wh-120" value-format="yyyy-MM-dd" v-model="searchData.beginTime"></el-date-picker>
          <span>至</span>
          <el-date-picker size="mini" class="wh-120" value-format="yyyy-MM-dd" v-model="searchData.endTime"></el-date-picker>
        </el-form-item>
        <el-form-item label="单据编号" label-width="90px" v-if="typeShow">
          <el-input v-model="searchData.orderCode" size="mini" maxlength="50"></el-input>
        </el-form-item>
        <el-button v-if="typeShow" size="mini" type="primary" icon="el-icon-search" class="seek" @click="queryData">查询</el-button>
        <el-button v-if="typeShow" type="primary" size="mini" class="add-staff" @click="addRecord" v-has="'supplies:beton:add'">新增采购计划单</el-button>
      </el-form>
    </div>
    <div class="tab-container" v-if="typeShow">
      <div class="table-data" style="height: 75%">
        <el-table :data="tableData" border v-loading="loading" height="100%" stripe :tooltip-effect="'light'" :header-cell-style="{ background: '#f1f6ff' }" ref="tableBox">
          <el-table-column label="序号" width="60" align="center">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (pageNum - 1) * pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="orderCode" label="单据编号" align="center"> </el-table-column>
          <el-table-column prop="projectBidName" label="标段项目" align="center" v-if="user.orgType == 4"> </el-table-column>
          <el-table-column prop="customerName" label="供应商" align="center"> </el-table-column>
          <el-table-column prop="rePurchaseApplies" label="关联物资申请单" align="center"> </el-table-column>
          <el-table-column prop="createUserName" label="填表人" align="center"> </el-table-column>
          <el-table-column prop="serviceTime" :label="user.orgType==5?'单据时间':'业务时间'" align="center"> </el-table-column>
          <el-table-column prop="confirmUserName" label="确认人" align="center" v-if="[5,4,10].includes(this.user.orgType)"> </el-table-column>
          <el-table-column prop="confirmTime" label="确认时间" align="center" v-if="[5,4,10].includes(this.user.orgType)"> </el-table-column>
          <el-table-column label="状态" prop="purchaseCodeName" align="center"> </el-table-column>
          <el-table-column prop="remark" label="备注" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column label="操作" align="center" width="300">
            <template slot-scope="{ row }">
              <el-button plain size="mini" @click="lookOver(row, 1)" v-has="'supplies:beton:query'">查看</el-button>
              <el-button plain size="mini" type="primary" @click="shareCode(row.pkId)" v-has="'supplies:beton:viewCode'" v-show="row.isCode">分享二维码</el-button>
              <el-button plain size="mini" v-has="'supplies:beton:update'" type="primary" @click="editRecord(row, 1)" v-if="row.isUpdate">编辑</el-button>
              <el-button plain size="mini" type="danger" v-has="'supplies:beton:withdraw'" @click="deleteRecord2(row.pkId)" v-show="row.isWithdraw">撤回</el-button>
              <el-button plain size="mini" type="danger" v-has="'supplies:beton:delete'" @click="deleteRecord(row.pkId)" v-show="row.isDelete">删除</el-button>
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
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <!-- 弹窗 -->
    <el-dialog :close-on-press-escape="false" :title="title" :visible="popup" width="60%" v-dialogDrag :close-on-click-modal="false" v-loading="loading" @close="close" top="3vw">
      <div class="dialog-form">
        <el-radio-group v-model="isCollapse" size="mini" v-if="form.purchaseCodeName == '已完成' || form.purchaseCodeName == '已确认'">
          <el-radio-button :label="0">基本信息</el-radio-button>
          <el-radio-button :label="1">关联入库单</el-radio-button>
        </el-radio-group>
        <div class="tab-two" v-show="isCollapse == 0">
          <el-form :model="form" :rules="rules" ref="form" class="row-height">
            <el-row :span="24" class="el-row-data">
              <el-col :span="8">
                <el-form-item label="采购计划单号" prop="orderCode" label-width="120px">
                  <el-input v-model="form.orderCode" size="mini" :disabled="btnStatus || !!allowModify" :maxlength="limitNum"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="user.orgType == 4">
                <el-form-item label="标段项目" prop="orderCode" label-width="120px">
                  <el-input v-model="form.projectBidName" size="mini" :disabled="btnStatus"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="供应商" prop="fkCustomerId" label-width="110px">
                  <el-select size="mini" @change="cutSupplier" v-model="form.fkCustomerId" class="wh" :disabled="btnStatus">
                    <el-option v-for="item in options" :key="item.pkId" :label="item.label" :value="item.value"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="关联物资申请单" label-width="140px">
                  <!-- 启用远程搜索，需要设置 filterable 和 remote -->
                  <el-select size="mini" collapse-tags multiple filterable remote :remote-method="remoteMethod" @change="selectOrder" value-key="pkId" @visible-change="restoreSelect" reserve-keyword v-model="form.rePurchaseApplies" class="wh" :disabled="btnStatus" :loading="loading2" v-if="num == 0">
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
              <el-col :span="8">
                <el-form-item label="直供分包单位" prop="fkSupplyCustomerId" label-width="120px">
                  <el-select size="mini" v-model="form.fkSupplyCustomerId" class="wh" :disabled="btnStatus" @change="supCusChange">
                    <el-option v-for="item in subcontractorsArr" :key="item.pkId" :label="item.customName" :value="item.pkId"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8" v-if="title == '采购计划单信息'">
                <el-form-item label="单据状态" label-width="110px">
                  <el-input v-model="form.purchaseCodeName" size="mini" disabled></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label-width="120px">
                  <label slot="label">收料地址</label>
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
                  <div>确认人:&nbsp; {{ form.confirmUserName }}</div>
                  <div>确认时间:&nbsp; {{ form.confirmTime }}</div>
                </div>
              </el-col>
              <!-- 驳回查看 -->
              <el-col :span="24" v-if="form.purchaseCodeName == '已驳回' && title == '采购计划单信息'">
                <div class="affirm">
                  <div>
                    驳回人:&nbsp; {{ form.confirmUserName }}
                    <div style="margin-top: 10px">驳回原因:&nbsp; {{ form.reason }}</div>
                  </div>
                  <div>驳回时间:&nbsp; {{ form.reasonTime }}</div>
                </div>
              </el-col>
            </el-row>
          </el-form>
          <h3 class="material">物料信息</h3>
          <div class="table-data" :class="num == 0 ? 'table2' : 'table1'">
            <el-table :data="accessoryList" height="100%" style="width: 100%" stripe :tooltip-effect="'light'" :header-cell-style="{ background: '#f1f6ff' }" :key="random">
              <el-table-column label="序号" type="index" width="60" align="center"> </el-table-column>
              <el-table-column label="物料名称" align="center" prop="materialName" v-if="form.rePurchaseApplies.length == 0 && num != 1">
                <template slot-scope="{ row }">
                  <el-input size="mini" :value="row.materialName" placeholder="点击选择物料" class="selectFac" @focus="selectMater(row)">
                    <el-button slot="append" icon="el-icon-more" @click="selectMater(row)" size="mini"></el-button>
                  </el-input>
                </template>
              </el-table-column>
              <!-- 查看或者处理状态 -->
              <el-table-column label="物料名称" align="center" prop="materialName" v-else> </el-table-column>
              <el-table-column label="物料分类" align="center" prop="materialTypeName" show-overflow-tooltip> </el-table-column>
              <el-table-column label="单位" width="80" align="center" prop="unitName"> </el-table-column>
              <el-table-column label="需求数量" align="center" prop="purchaseNum" width="150" v-if="!btnStatus">
                <template slot-scope="{ row }">
                  <el-input v-model.trim="row.purchaseNum" size="mini" oninput="if(value){value=value.replace(/^\D*(\d*(?:\.\d{0,6})?).*$/g, '$1')} if(value>99999999.999999){value=99999999.999999}"></el-input>
                </template>
              </el-table-column>
              <el-table-column label="需求数量" align="center" prop="purchaseNum" width="150" v-else> </el-table-column>
              <!-- <el-table-column label="收货数量" align="center" prop="purchaseNum" v-if="user.orgType == 5 && form.purchaseCodeName != '待确认'"> </el-table-column> -->
              <el-table-column label="操作" align="center" width="100" v-if="form.rePurchaseApplies.length == 0 && num != 1">
                <template slot-scope="{ row, $index }">
                  <span class="addAcc" v-if="accessoryList.length == $index + 1" @click="addAcc(row)" title="新增">
                    <i class="el-icon-plus"></i>
                  </span>
                  <span class="delAcc" @click="delAcc(row)" title="删除">
                    <i class="el-icon-close"></i>
                  </span>
                </template>
              </el-table-column>
              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>
          </div>
          <div slot="footer" class="dialog-footer" v-if="num != 1">
            <el-button type="primary" class="certainty" @click="modifyState(2)" v-if="num == 3">确认</el-button>
            <el-button type="danger" class="certainty" @click="turnDown" v-if="num == 3">驳回</el-button>
            <el-button type="primary" class="certainty" @click="submit('form', 0)" v-if="num == 0 || num == 2">保存草稿</el-button>
            <el-button type="primary" class="certainty" @click="submit('form', 1)" v-if="num == 0 || num == 2">提交单据</el-button>
            <el-button class="certainty" type="primary" plain @click="popup = false" v-if="num != 1">取 消</el-button>
          </div>
        </div>
        <div class="tab-two table-data" v-show="isCollapse == 1">
          <el-table :data="tableBills" border height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
            <el-table-column prop="date" label="序号" width="60" align="center">
              <template slot-scope="scope">
                <div style="text-align: center">
                  {{ scope.$index + 1 }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="orderCode" label="入库单据" align="center">
              <template slot-scope="{ row }">
                <span class="blue" @click="orderClick(row, 5)">{{ row.orderCode }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="单据日期" align="center"> </el-table-column>
            <el-table-column prop="warehouseName" label="入库仓库" align="center"> </el-table-column>
            <el-table-column prop="receiverName" label="签收人" align="center"> </el-table-column>
            <el-table-column prop="receiverTime" label="签收时间" align="center"> </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
      </div>
    </el-dialog>
    <!-- 二维码弹框 -->
    <div class="box-code">
      <el-dialog :close-on-press-escape="false" class="qr-dialog" width="20%" height="680px" :visible.sync="qrcode" title="采购单二维码" :destroy-on-close="true" @close="close2" v-loading="loading">
        <div class="dialog-form">
          <p class="hint-tit">
            请使用系统APP或者微信扫一扫 <br />
            完成供应商录入
          </p>
          <div ref="qrCode" id="qrCode">
            <div class="codeOk" v-if="codeOk">
              <i class="el-icon-circle-check iconColor mb-20"></i>
              <div class="mb-60">扫描成功</div>
              <div>请在手机上根据提示操作</div>
              <el-button type="text" @click="refreshClick">重新加载二维码</el-button>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>

    <!-- 选择物料弹框 新增 materialTypeCode 传参后端物料类型-->
    <materialsSelect :materDialog.sync="materDialog" :selectMater="accessoryList" @getSelect="getSelect" :showType="2" :fkCustomId="form.fkCustomerId" materialTypeCode="materials_beton" v-if="num != 1"></materialsSelect>
    <checkOrderDialog :checkOrderDialog.sync="checkOrderDialog" :orderType="orderType" :pkId="orderPkId"> </checkOrderDialog>
  </div>
</template>

<script>
import pageInation from "../../components/tablePaging";
import selectTree from "../../components/selectTree/selectTree.vue"; // 引入自定义下拉树形组建
import materialsSelect from "../../components/materialsSelect/materialsSelect.vue"; // 物料选择
import QRCode from "qrcodejs2";
import checkOrderDialog from "./components/checkOrderDialog.vue"; // 查询出入库单信息
import moment from "moment";
export default {
  name: "purchase",
  data() {
    return {
      supplier2: false,
      // 采购类型 purchase_ordinary:普通材料采购,purchase_concrete:混凝土采购,purchase_rebar:钢筋半成品
      purchaseTypeCode: "purchase_concrete",
      // 搜索数据
      searchData: {
        projectName: "",
        purchaseCode: "",
        beginTime: "",
        endTime: "",
        orderCode: "",
        fkCustomerId: "",
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
        fkCustomerId: "",
        orderCode: "",
        orderApplyMaterialDetails: [],
        purchaseCode: "",
        leaderName: "",
        fkBidProjectId: "", // 标段项目
        rePurchaseApplies: [], // 关联申请单
        inspectName: "",
        serviceTime: "", // 业务时间
        remark: "",
        receiptAddress: "",
        fkSupplyCustomerId: "",
        reason: "", // 驳回原因
        confirmUserName: "", // 驳回人
        reasonTime: "", // 驳回时间
        confirmTime: "" // 驳回时间
      },
      title: "",
      rules: {
        orderCode: [
          {
            required: true,
            message: "请输入采购单号",
            trigger: ["change", "blur"]
          }
        ],
        leaderName: [
          {
            required: true,
            message: "请输入负责人",
            trigger: ["change", "blur"]
          }
        ],
        serviceTime: [
          {
            required: true,
            message: "请选择业务时间",
            trigger: ["change", "blur"]
          }
        ],
        fkSupplyCustomerId: [
          {
            required: true,
            message: "请选择直供分包单位",
            trigger: ["change", "blur"]
          }
        ]
      },
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
      qrcode: false, // 控制二维码
      num: 1, // 1 查看 2 处理  3 编辑
      checkOrderDialog: false,
      orderType: 5,
      orderPkId: "",
      allowModify: 0,
      limitNum: 1000,
      typeCode: "",
      subcontractorsArr: [], // 直供分包单位
      codeOk: false,
      codeTimer: null,
      codeTimer2: null,
      unique: "",
      clickId: "",
      typeShow: true
    };
  },
  components: {
    pageInation,
    selectTree,
    materialsSelect,
    QRCode,
    checkOrderDialog
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  watch: {
    "form.fkCustomerId": function (val) {
      if (val) {
        for (let i = 0; i < this.options.length; i++) {
          if (val == this.options[i].pkId) {
            console.log(this.options[i]);
            // 只有新增的时候才能切换供应商清空id
            if (this.num === 0) {
              this.form.fkSupplyCustomerId = "";
            }
            this.subcontractorsArr = this.options[i].supplyCustoms;
          }
        }
      }
    }
  },
  mounted() {
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          return (this.typeShow = false);
        }
        // this.supplier()
        // 施工单位登录下获取搜索标段项目
        if (this.user.orgType == 4) {
          this.getItemListNoUserId();
        }
        // 项目部登录获取供应商
        if (this.user.orgType == 5) {
          this.supplier();
          this.getData();
        }

        // 获取物料
        // this.listAllAndMaterial();
      } else {
        this.$message.error(res.msg);
      }
    });
  },
  beforeDestroy() {
    // 清除定时器
    this.clearCodetime();
  },
  methods: {
    selectIds(arr, obj, isTrue) {
      if (arr.length) {
        if (arr.length > 1) {
          this.searchData.fkBidProjectId = arr[1];
        } else {
          this.searchData.fkBidProjectId = arr[0];
        }
        if (isTrue) {
          this.queryData();
        }
        this.projectIdChange(this.searchData.fkBidProjectId);
      }
    },
    orderClick(item, type) {
      this.orderType = type;
      this.orderPkId = item.pkId;
      this.checkOrderDialog = true;
    },

    // 分享二维码
    shareCode(id) {
      this.codeOk = false;
      const location = window.location.origin;
      this.clickId = id;
      console.log(location);
      this.$api
        .getBusinessCode({ businessType: 8 })
        .then(res => {
          if (res.code === 200) {
            this.qrcodeNumber = res.data.typeCode;
            console.log(`${location}/h5/#/pages/oderInfo/oderInfo?pkId=${id}&orderCode=${this.qrcodeNumber}`);
            this.qrcode = true;
            this.$nextTick(res => {
              this.$api.addQRCode().then(res => {
                if (res.code === 200) {
                  this.unique = res.data;
                  const data = JSON.stringify(encodeURIComponent(`${location}/h5/#/pages/oderInfo/oderInfo?pkId=${id}&orderCode=${this.qrcodeNumber}`));
                  console.log(`${location}/h5/#/pages/h5/scanCodeTran?type=5&unique=${this.unique}&data=${data}`);
                  new QRCode("qrCode", {
                    correctLevel: 3,
                    width: 260,
                    height: 260,
                    text: `${location}/h5/#/pages/h5/scanCodeTran?type=5&unique=${this.unique}&data=${data}`
                  });

                  this.queryQRCode();
                  // setTimeout(()=>{
                  //   this.updateQRCode()
                  // },6000)
                } else {
                  this.$message.warning(res.msg);
                }
              });
            });
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(error => {
          this.$message.warning(error);
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
    updateQRCode() {
      this.$api.updateQRCode({ unique: this.unique }).then(res => {
        if (res.code === 200) {
        } else {
        }
      });
    },
    refreshClick() {
      this.codeOk = false;
      this.shareCode(this.clickId);
      this.clearCodes();
    },
    clearCodes() {
      const dom = this.$refs.qrCode;
      dom.removeChild(dom.childNodes[1]);
      dom.removeChild(dom.childNodes[1]);
    },
    clearCodetime() {
      // 清除定时器
      clearInterval(this.codeTimer);
      this.codeTimer = null;
      this.codeTimer2 = null;
    },
    selectMater(item) {
      this.rowData = item;
      this.materDialog = true;
    },
    // 物料选择
    getSelect(row) {
      let idStatus = false;
      this.accessoryList.forEach(item => {
        if (item.fkMaterialId == row.pkId) {
          idStatus = true;
          return this.$message.warning("不能添加相同的物料信息");
        }
      });
      if (!idStatus) {
        this.rowData.fkMaterialId = row.pkId;
        this.rowData.materialName = row.materialName;
        this.rowData.materialTypeName = row.fkTypeName;
        this.rowData.unitName = row.fkUnitName; // 单位
      }

      // 解决table刷新数据问题
      this.random = Math.random();
    },
    // 选择申请单
    selectOrder(data) {
      if (data.length === 0) {
        this.form.orderApplyMaterialDetails = [];
        return (this.accessoryList = [{ fkMaterialId: 1, materialName: "", materialTypeName: "", unitName: "", purchaseNum: "" }]); // 初始化物料
      }
      this.accessoryList = [];
      const arr = data;
      const dataArr = [];
      // 取出物料保存在dataArr
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].materialVos.length; j++) {
          arr[i].materialVos[j].purchaseNum = arr[i].materialVos[j].supplyNum;
          arr[i].materialVos[j].fkMaterialId = arr[i].materialVos[j].pkId;
          arr[i].materialVos[j].unitName = arr[i].materialVos[j].fkUnitName;
          arr[i].materialVos[j].materialTypeName = arr[i].materialVos[j].fkTypeName;
          dataArr.push(arr[i].materialVos[j]);
        }
        this.searchNoLink(this.form.rePurchaseApplies);
      }
      // 添加到物料信息 去重合并数量
      const baseArr = [];
      const newArry = [];
      for (const i in dataArr) {
        if (baseArr.includes(dataArr[i].pkId)) {
          newArry[baseArr.indexOf(dataArr[i].pkId)].purchaseNum += dataArr[i].purchaseNum;
        } else {
          baseArr.push(dataArr[i].pkId);
          newArry.push(dataArr[i]);
        }
      }
      this.accessoryList = newArry.map(item => ({ ...item }));
    },
    // 下拉框失去焦点还原原始下拉数据
    restoreSelect(boole) {
      // 下拉框关闭就请求原始数据
      if (!boole) {
        this.getApplicationData();
      }
    },
    // 远程输入搜索
    remoteMethod(query) {
      if (query !== "") {
        this.loading2 = true;
        setTimeout(() => {
          this.loading2 = false;
          // 远程搜索
          this.getApplicationData(query);
        }, 200);
      } else {
        this.getApplicationData();
      }
    },
    // 树形选中事件
    checked2(arr, obj) {
      console.log(arr);
    },

    // 施工单位登录 根据标段id获取分包单位下拉列表
    projectIdChange(id) {
      this.searchData.fkCustomerId = "";
      //  选择全部禁用分包单位下拉选择
      if (id == "") {
        this.searchData.fkCustomerId = "";
        this.options = [];
      } else if (this.user.orgType == 4 || this.user.orgType == 10) {
        this.supplier(id);
      }
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
    // 获取供应商
    supplier(id) {
      this.$api.searchNoLinkOrgId({ projectBidId: id, customType: 3, supplierType: 2 }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.customName;
            item.value = item.pkId;
          });
          console.log("res -----> ", res);
          this.options = res.data;
        }
      });
    },
    // 供应商切换
    cutSupplier() {
      this.form.rePurchaseApplies = [];
      this.form.orderApplyMaterialDetails = []; // 清空物料
      this.accessoryList = [{ fkMaterialId: 1, materialName: "", materialTypeName: "", unitName: "", purchaseNum: "" }]; // 初始化物料
      this.getApplicationData();
    },
    // 获取 关联物资申请单
    getApplicationData(query) {
      let fkSupplyCustomerId = "";
      if (this.form.fkSupplyCustomerId) {
        fkSupplyCustomerId = this.form.fkSupplyCustomerId;
      }
      this.$api.getOrderApply({ pageNum: 1, pageSize: 20, query, fkCustomerId: this.form.fkCustomerId, customerType: 3, fkSupplyCustomerId }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.customName;
            item.value = item.pkId;
          });
          this.applicationData = res.data;
        }
      });
    },
    // 获取分页列表
    getData() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        purchaseTypeCode: this.purchaseTypeCode
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
      this.supplier2 = true;
      this.isCollapse = 0;
      this.num = num;
      this.btnStatus = true;
      this.queryUserinfo(item.pkId);
      this.title = "采购计划单信息";
      this.popup = true;
    },
    // 新增
    addRecord() {
      this.num = 0;
      this.isCollapse = 0;
      this.btnStatus = false;
      this.supplier2 = false;

      // 清空对象
      Object.keys(this.form).forEach(key => {
        if (this.form[key] instanceof Array) {
          this.form[key] = [];
        } else {
          this.form[key] = "";
        }
      });

      this.accessoryList = [{ fkMaterialId: 1, materialName: "", materialTypeName: "", unitName: "", purchaseNum: "" }]; // 初始化物料
      // 获取申请单号
      this.$api.getBusinessCode({ businessType: 5 }).then(res => {
        if (res.code === 200) {
          this.form.orderCode = res.data.typeCode;
          this.allowModify = res.data.allowModify;
          this.limitNum = res.data.limitNum;
          this.typeCode = res.data.typeCode;
        } else {
          this.$message.warning(res.msg);
        }
      });

      this.$nextTick(() => {
        if (this.options.length) {
          console.log("this.options -----> ", this.options);
          this.form.fkCustomerId = this.options[0].pkId; // 新增供应商默认选中第一个
          // 关联物资申请单
          this.getApplicationData();
        }
      });
      // this.form.rePurchaseApplies = [{ pkId: "1567689178869665793" }, { pkId: "1569863390039216129" }];
      this.title = "新增采购计划单";
      const time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
      this.form.serviceTime = time;
      this.form.leaderName = this.user.userName;
      this.popup = true;
    },
    // 编辑
    editRecord(item, ids) {
      this.num = 2;
      this.btnStatus = false;
      this.supplier2 = false;
      this.isCollapse = 0;
      this.queryUserinfo(item.pkId, ids);
      this.title = "编辑采购计划单";
      this.popup = true;
    },
    // 查询采购单信息
    queryUserinfo(id, ids) {
      this.$api.queryPurchaseOrder({ pkId: id }).then(res => {
        console.log("res -----> ", res);
        if (res.code == 200) {
          this.form = res.data;
          this.form.fkSupplyCustomerId = res.data.fkSupplyCustomerName;
          if (ids == 1) {
            console.log("111 -----> ", 111);
            this.form.fkSupplyCustomerId = "";
          }
          if (this.options.length == 0) {
            this.form.fkCustomerId = "";
          }
          // 物料信息
          this.typeCode = res.data.orderCode;
          this.accessoryList = res.data.orderApplyMaterialDetails;
          this.tableBills = res.data.relationInputInventoryVos;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 删除
    deleteRecord(pkId) {
      this.$confirm("确定删除该采购计划单信息？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$api.deletePurchaseOrder({ pkId }).then(res => {
            if (res.code === 200) {
              this.$message.success(res.msg);
              this.getData();
            } else {
              this.$message.warning(res.msg);
            }
          });
        })
        .catch(() => {});
    },
    // 撤回
    deleteRecord2(pkId) {
      this.form.pkId = pkId;
      this.$confirm("确定撤回该采购计划单?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.modifyState(1);
        })
        .catch(() => {});
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
    submit(formName, num) {
      // console.log(this.form.orderApplyMaterialDetails);
      this.form.orderApplyMaterialDetails = [];
      // accessoryList是物料信息 编辑赋值的原始值，也是增加删除后的现有值 筛选处出来给到this.form.orderApplyMaterialDetails 传后端
      this.accessoryList.forEach(item => {
        if (item.materialName && item.purchaseNum) {
          this.form.orderApplyMaterialDetails.push(item);
        }
      });
      if (this.form.orderApplyMaterialDetails.length === 0) {
        return this.$message.warning("请选择物料和申请数量");
      }
      // 处理;物资申请单ID集
      let arr = [];
      // 此处判断主要是用于编辑的情况下提交  后端返回的会是字符串 rePurchaseApplies
      if (this.form.rePurchaseApplies instanceof Array) {
        console.log("is Array", this.form.rePurchaseApplies);
        this.form.rePurchaseApplies.forEach(item => {
          arr.push(item.pkId);
        });
      }

      // 编辑的时候判断有没有applyIds;
      if (this.form.applyIds && this.num == 2) {
        arr = this.form.applyIds;
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          const data = {
            purchaseCode: num,
            fkCustomerId: this.form.fkCustomerId,
            leaderName: this.form.leaderName,
            orderCode: this.form.orderCode,
            orderPurchaseMaterialDetails: this.form.orderApplyMaterialDetails,
            purchaseTypeCode: this.purchaseTypeCode,
            serviceTime: this.form.serviceTime,
            rePurchaseApplies: arr,
            receiptAddress: this.form.receiptAddress, // 收货地址
            fkSupplyCustomerId: this.form.fkSupplyCustomerId,
            remark: this.form.remark
          };
          if (data.orderCode == this.typeCode) {
            data.isUpdate = 0;
          } else {
            data.isUpdate = 1;
          }
          this.loading = true;
          console.log(data);
          if (this.title != "编辑采购计划单") {
            data.allowModify = this.allowModify;
            data.limitNum = this.limitNum;
            this.$api
              .addPurchaseOrder(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  if (num == 0) {
                    this.$message.success("保存草稿成功");
                  } else {
                    this.$message.success("新增成功");
                  }
                  this.getData();
                  this.popup = false;
                  this.$refs[formName].resetFields();
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
          } else {
            data.pkId = this.form.pkId;
            this.$api
              .editPurchaseOrder(data)
              .then(res => {
                if (res.code == 200) {
                  this.loading = false;
                  this.$message({
                    type: "success",
                    message: res.msg
                  });
                  this.getData();
                  this.popup = false;
                  this.$refs[formName].resetFields();
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
          }
        } else {
          return false;
        }
      });
    },
    // 弹窗取消按钮
    callOff() {
      this.popup = false;
    },
    close() {
      this.popup = false;
      this.supplier2 = false;
      // this.$refs.form.resetFields();
      // this.form.orderApplyMaterialDetails = [];
    },
    close2() {
      this.getData();
      this.clearCodetime();
    },
    // 外面搜索按钮
    queryData() {
      this.pageNum = 1;
      this.getData();
    },
    // 添加物料
    addAcc(row) {
      this.accessoryList = [
        ...this.accessoryList,
        {
          fkMaterialId: (Math.random() + new Date().getTime()).toString(32).slice(0, 8), // 永远不会重复的id
          materialName: "",
          materialTypeName: "",
          unitName: "",
          purchaseNum: ""
        }
      ];
    },
    // 删除物料
    delAcc(row) {
      if (this.accessoryList.length === 1) {
        this.accessoryList = [{ fkMaterialId: 1, materialName: "", materialTypeName: "", unitName: "", purchaseNum: "" }];
      } else {
        this.accessoryList = this.accessoryList.filter(item => item.fkMaterialId !== row.fkMaterialId);
      }
    },
    // 获取物料集
    listAllAndMaterial(customerId) {
      this.$api.listAllAndMaterial({ customerId: "1532167837482483714" }).then(res => {
        if (res.code === 200) {
          this.options2 = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 物料选择事件
    cascaderChange(row) {
      console.log(this.$refs.cascader.getCheckedNodes());
      row.classify = this.$refs.cascader.getCheckedNodes()[0].pathLabels[0];
      row.name = this.$refs.cascader.getCheckedNodes()[0].value;
      // this.dopeSheet.fkMaterialId = ;
      // this.dopeSheet.detailName = this.$refs.cascader.getCheckedNodes()[this.$refs.cascader.getCheckedNodes().length - 1].data.typeName;
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
    },
    // 直供分包商变更
    supCusChange() {
      // this.form.rePurchaseApplies = [];
      this.getApplicationData();
    },
    searchNoLink(arr) {
      let ids = [];
      arr.forEach(item => {
        ids.push(item.fkOrgId);
      });

      let data = {
        // supplierType: "2",
        fkSupplyOrgIds: ids.join(),
        customId: this.form.fkCustomerId
        // return console.log(this.form.fkCustomerId)
      };
      this.$api.searchNoLink(data).then(res => {
        if (res.code == 200) {
          this.subcontractorsArr = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
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
  margin-left: 60px;
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
  height: 300px !important;
}

.table2 {
  height: 380px !important;
}

.dialog-footer {
  position: absolute;
  width: 100%;
  bottom: 10px;
  display: flex;
  justify-content: center;

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
/deep/ .el-dialog {
  min-height: 800px;
}

.box-code {
  /deep/ .el-dialog {
    height: 400px;
  }
}

.qr-dialog {
  text-align: center;

  p {
    color: #3aa1ff;
  }

  #qrCode {
    display: flex;
    justify-content: center;
    padding-top: 10px;
  }
}

.blue {
  color: #02aff4;
  cursor: pointer;
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
</style>
