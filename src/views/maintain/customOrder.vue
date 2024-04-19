<template>
  <div class="app-container">
    <!-- 头部搜索 -->
    <custom @choose="choose" v-show="!basicStatus" :types="'2'"></custom>
    <div v-show="basicStatus" class="search-bgc search-mr headline">
      <span class="item"><el-button size="mini" icon="el-icon-s-unfold" @click="choiceProject" style="padding: 0"></el-button>{{ headDate.orgName }}</span>
      <span class="item">管理员手机号码：{{ headDate.telephone }}</span>
      <span class="item">联系人:{{ headDate.linkMan }}</span>
      <span class="item">联系人手机号码：{{ headDate.linkPhone }}</span>
      <span class="item">到期日期：{{ headDate.expireTime }}</span>
    </div>
    <div class="search-bgc search-mr" v-show="basicStatus">
      <el-form :model="searchData" class="form-data">
        <el-form-item label="单据类型" label-width="80px">
          <el-select v-model="searchData.orderCode" size="mini" class="wh-200">
            <el-option label="全部" value=""></el-option>
            <el-option v-for="(item, idx) in billsType" :key="idx" :label="item.name" :value="item.key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="规则名称" label-width="90px">
          <el-input v-model="searchData.ruleName" size="mini" class="wh-200"></el-input>
        </el-form-item>
        <el-button size="mini" type="primary" class="seek" @click="queryData">搜索</el-button>
        <el-button type="primary" size="mini"  v-has="'maintain:customOrder:add'" class="add-staff btn-right" @click="addRecord">新增规则</el-button>
      </el-form>
    </div>
    <div class="tab-container" v-show="basicStatus">
      <el-table :data="tableData" border v-loading="loading" height="60%" :header-cell-style="{ background: '#f1f6ff' }">
        <el-table-column label="序号" width="60" align="center">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (searchData.pageNum - 1) * searchData.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="ruleName" label="规则名称" align="center"> </el-table-column>
        <el-table-column prop="customOrderRuleSet" label="规则编码" align="center"> </el-table-column>
        <el-table-column prop="customOrderSet" label="已配置单据" align="center"> </el-table-column>
        <el-table-column prop="allowModify" label="是否允许手动修改" align="center">
          <template slot-scope="{ row }">
            <span v-if="row.allowModify == '0'">允许</span>
            <span v-if="row.allowModify == '1'">不允许</span>
          </template>
        </el-table-column>
        <el-table-column prop="limitNum" label="限制长度" align="center"> </el-table-column>
        <el-table-column label="操作" align="center" width="400">
          <template slot-scope="{ row }">
            <el-button size="mini" type="primary" v-has="'maintain:customOrder:query'" @click="examine(row.pkId)">查看</el-button>
            <el-button size="mini" type="primary" v-has="'maintain:customOrder:update'" @click="editOrder(row.pkId)">编辑</el-button>
            <el-button size="mini" type="inprimaryfo" v-has="'maintain:customOrder:configure'" @click="configuration(row.pkId)">配置单据</el-button>
            <el-button size="mini" type="danger" v-has="'maintain:customOrder:delete'" @click="deleteOrder(row.pkId)">删除</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <!-- 分页 -->
      <pageInation :currentPage="searchData.pageNum" :pageSize="searchData.pageSize" :total="total" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></pageInation>
    </div>
    <!-- 配置单据弹窗 -->
    <el-dialog title="配置单据" width="400px" :visible.sync="configurationShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div>
        <div class="rule">规则名称:<span class="weight-600">采购计划单规则</span></div>
        <div class="ml-20">
          <el-checkbox-group v-model="checkList">
            <el-checkbox class="rule-check-item" v-for="(item, idx) in billsType" :key="idx" :label="item.key" :value="item.key">{{ item.name }}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" type="primary" @click="ruleSubmit">确 定</el-button>
        <el-button size="mini" @click="configurationShow = false">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 新增修改弹窗 -->
    <el-dialog :title="ruleTittle" width="600px" :visible.sync="ruleShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-form :model="ruleData" :rules="rules" ref="form" class="row-height">
        <div>
          <el-row :span="24" class="el-row-data">
            <el-col :span="24">
              <el-form-item label="规则名称" prop="ruleName" label-width="110px">
                <el-input v-model="ruleData.ruleName" size="mini"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="14">
              <el-form-item label="允许手动修改" prop="ruleName" label-width="110px">
                <el-radio-group v-model="ruleData.allowModify">
                  <el-radio :label="0">允许</el-radio>
                  <el-radio :label="1">不允许</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="10" v-if="ruleData.allowModify == '0'">
              <el-form-item label="限制长度" prop="limitNum" label-width="100px">
                <el-input v-model="ruleData.limitNum" @input="ruleData.limitNum = ruleData.limitNum.replace(/^(0+)|[^\d]+/g, '')" size="mini"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <div class="rule">
            <span>编码生成规则</span>
            <el-tooltip effect="dark" placement="bottom-start">
              <div slot="content">
                <div class="describe-title">
                  选项说明：
                </div>
                <div class="describe-box">
                  无： 即为空值。只在首条规则出现。 固定字段：用户输入字段，在编码中原样输出。<br />
                  按日期自动生成：自动输出当前日期对应时间数字。<br />
                  yyyy：年份 MM： 月份 dd： 月份中的具体号数<br />
                  HH： 小时 mm： 分钟 ss： 秒数<br />
                  随机生成数字：在指定位数随机生成指定格式。<br />
                  按序号递增：序号从1开始逐增，不满指定位数高位补零。<br />
                  每天按序号递增：序号从1开始逐增，不满指定位数高位补零。第2天重置，序号又从1开始。<br />
                  每月按序号递增：序号从1开始逐增，不满指定位数高位补零。第2个月重置，序号又从1开始。<br />
                  每年按序号递增：序号从1开始逐增，不满指定位数高位补<br />
                </div>
              </div>
              <i class="el-icon-question"></i>
            </el-tooltip>
            <span class="ml-20">提示：最多增加10条组成规则</span>
          </div>
          <div v-for="(item, idx) in ruleDetails" :key="idx" class="rule-numerical">
            <span class="numerical-order">{{ idx + 1 }}</span>
            <el-select v-model="item.ruleCode" size="mini" class="wh-200">
              <el-option v-for="(item, idx) in ruleList" :key="idx" :label="item.keyVal" :value="item.keyName"></el-option>
            </el-select>
            <el-input v-if="item.ruleCode == 1" v-model="item.ruleHead" size="mini" class="wh-222"></el-input>
            <el-input v-if="item.ruleCode == 3" @input="item.ruleHead = item.ruleHead.replace(/^(0+)|[^\d]+/g, '')" v-model="item.ruleHead" size="mini" class="wh-203"></el-input>
            <span v-if="item.ruleCode == 3">位</span>
            <el-input v-if="item.ruleCode == 4 || item.ruleCode == 5 || item.ruleCode == 6 || item.ruleCode == 7" @input="item.ruleHead = item.ruleHead.replace(/^(0+)|[^\d]+/g, '')" v-model="item.ruleHead" size="mini" class="wh-90"></el-input>
            <span v-if="item.ruleCode == 4 || item.ruleCode == 5 || item.ruleCode == 6 || item.ruleCode == 7">至</span>
            <el-input v-if="item.ruleCode == 4 || item.ruleCode == 5 || item.ruleCode == 6 || item.ruleCode == 7" @input="item.ruleTail = item.ruleTail.replace(/^(0+)|[^\d]+/g, '')" v-model="item.ruleTail" size="mini" class="wh-90"></el-input>
            <span v-if="item.ruleCode == 4 || item.ruleCode == 5 || item.ruleCode == 6 || item.ruleCode == 7">位</span>
            <el-select v-if="item.ruleCode == 2" v-model="item.ruleHead" size="mini" class="wh-222">
              <el-option v-for="(item, idx) in itemType" :key="idx" :label="item.keyVal" :value="item.keyName"></el-option>
            </el-select>
            <el-button v-if="item.ruleCode != 8" @click="removeDetails(idx)" class="border-no color-red" icon=" el-icon-close"></el-button>
            <el-button v-if="item.ruleCode != 8" @click="addDetails" class="border-no color-green" icon="  el-icon-plus"></el-button>
          </div>
        </div>
        <div class="dialog-footer">
          <el-button size="mini" type="primary" @click="submitRule('form')">确 定</el-button>
          <el-button size="mini" @click="ruleShow = false">取 消</el-button>
        </div>
      </el-form>
    </el-dialog>
    <!-- 查看弹窗 -->
    <el-dialog title="单号规则信息" width="600px" :visible.sync="examineShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <el-radio-group size="mini" v-model="tabPosition" style="margin-top:20px;">
        <el-radio-button label="1">规则信息</el-radio-button>
        <el-radio-button label="2">配置单据</el-radio-button>
      </el-radio-group>
      <div v-show="tabPosition == 1" class="examineShow-box">
        <div class="rule" style="text-indent: 2em;">规则名称 <el-input disabled v-model="ruleData.ruleName" size="mini" class="wh-300"></el-input></div>
        <div class="rule">
          允许手动修改
          <el-radio-group v-model="ruleData.allowModify">
            <el-radio disabled :label="0">允许</el-radio>
            <el-radio disabled :label="1">不允许</el-radio>
          </el-radio-group>
          <span v-if="ruleData.allowModify == '0'" class="ml-20">限制长度</span>
          <span v-if="ruleData.allowModify == '0'">
            <el-input class="wh-100" v-model="ruleData.limitNum" size="mini" disabled></el-input>
          </span>
        </div>
        <div class="rule">
          <span>编码生成规则</span>
        </div>
        <div v-for="(item, idx) in ruleDetails" :key="idx" class="rule-numerical">
          <span class="numerical-order">{{ idx + 1 }}</span>
          <el-select v-model="item.ruleCode" size="mini" class="wh-200" disabled>
            <el-option v-for="(item, idx) in ruleList" :key="idx" :label="item.keyVal" :value="item.keyName"></el-option>
          </el-select>
          <el-input v-if="item.ruleCode == 1" disabled v-model="item.ruleHead" size="mini" class="wh-222"></el-input>
          <el-input v-if="item.ruleCode == 3" disabled @input="item.ruleHead = item.ruleHead.replace(/^(0+)|[^\d]+/g, '')" v-model="item.ruleHead" size="mini" class="wh-203"></el-input>
          <span v-if="item.ruleCode == 3">位</span>
          <el-input v-if="item.ruleCode == 4 || item.ruleCode == 5 || item.ruleCode == 6 || item.ruleCode == 7" disabled @input="item.ruleHead = item.ruleHead.replace(/^(0+)|[^\d]+/g, '')" v-model="item.ruleHead" size="mini" class="wh-90"></el-input>
          <span v-if="item.ruleCode == 4 || item.ruleCode == 5 || item.ruleCode == 6 || item.ruleCode == 7">至</span>
          <el-input v-if="item.ruleCode == 4 || item.ruleCode == 5 || item.ruleCode == 6 || item.ruleCode == 7" disabled @input="item.ruleTail = item.ruleTail.replace(/^(0+)|[^\d]+/g, '')" v-model="item.ruleTail" size="mini" class="wh-90"></el-input>
          <span v-if="item.ruleCode == 4 || item.ruleCode == 5 || item.ruleCode == 6 || item.ruleCode == 7">位</span>
          <el-select v-if="item.ruleCode == 2" v-model="item.ruleHead" size="mini" class="wh-222" disabled>
            <el-option v-for="(item, idx) in itemType" :key="idx" :label="item.keyVal" :value="item.keyName"></el-option>
          </el-select>
        </div>
      </div>
      <div v-show="tabPosition == 2" class="examineShow-box">
        <div class="ml-20">
          <el-checkbox-group v-model="checkList" disabled>
            <el-checkbox class="rule-check-item" v-for="(item, idx) in billsType" :key="idx" :label="item.key" :value="item.name">{{ item.name }}</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </el-dialog>
    <el-dialog title="选择项目部"  width="70%" :visible.sync="choiceShow" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div style="height: 500px;">
        <custom @choose="choose" :types="'2'" ref="custom" :status="choiceShow"></custom>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import custom from "./compomemts/custom.vue";
import pageInation from "../../components/tablePaging.vue";
export default {
  name: "customOrder",
  data() {
    return {
      basicStatus: false,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        orderCode: "",
        // ruleName:"",
        fkOrgId: ""
      },
      total: 0,
      tableData: [],
      billsType: [],

      itemType: [],
      loading: false,
      configurationShow: false,
      regulationData: [
        { label: "设计变更数据", val: "1" },
        { label: "物资申请单", val: "2" },
        { label: "普通材料采购计划单", val: "3" },
        { label: "普通材料发料单", val: "4" },
        { label: "混凝土采购计划单", val: "5" },
        { label: "钢筋半成品采购计划单", val: "6" },
        { label: "出库单", val: "7" },
        { label: "入库单", val: "8" },
        { label: "盘点单", val: "9" }
      ],
      checkList: [],
      ruleShow: false,
      ruleTittle: "",
      ruleData: {
        allowModify: "",
        ruleName: "",
        limitNum: ""
      },
      ruleList: [],
      ruleDetails: [{ ruleCode: "8", ruleHead: "", ruleTail: "" }],
      examineShow: false,
      tabPosition: "1",
      choiceShow: false,
      headDate: {},
      rules: {
        ruleName: [
          {
            required: true,
            message: "请输入规则名称",
            trigger: ["blur"]
          }
        ],
        ruleName: [
          {
            required: true,
            message: "请选择是否允许手动修改",
            trigger: ["blur"]
          }
        ],
        limitNum: [
          {
            required: true,
            message: "请输入限制长度",
            trigger: ["blur"]
          }
        ]
      },
      fkRuleId: ""
    };
  },
  components: {
    custom,
    pageInation
  },
  mounted() {
    // this.$store.dispatch("getDictionariesData", 1).then(res => {
    //   this.billsType = res;
    // });
    this.$store.dispatch("getDictionariesData", 27).then(res => {
      this.ruleList = res;
    });
    this.$store.dispatch("getDictionariesData", 31).then(res => {
      this.itemType = res;
    });
  },
  methods: {
    searchOrderTypeByOrgId(){
      this.$api.searchOrderTypeByOrgId({orgId: this.headDate.pkId}).then(res=>{
        if(res.code == 200){
          this.billsType = res.data
        }else{ this.$message.warning(res.msg)}
      })
    },
    choose(item) {
      this.headDate = item;
      this.basicStatus = true;
      this.choiceShow = false;
      this.searchData.fkOrgId = item.pkId;
      this.queryData();
      this.searchOrderTypeByOrgId();
    },

    choiceProject() {
      this.choiceShow = true;
      this.$nextTick(() => {
        this.$refs.custom.reset();

      });
    },
    // 查询列表
    queryData() {
      this.$api.customOrderRuleList(this.searchData).then(res => {
        if (res.code == 200) {
          this.tableData = res.data.records;
          this.total = parseInt(res.data.total);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 新增
    addRecord() {
      this.ruleTittle = "新增单号规则";
      Object.keys(this.ruleData).forEach(key => {
        if (this.ruleData[key] instanceof Array) {
          this.ruleData[key] = [];
        } else {
          this.ruleData[key] = "";
        }
      });
      this.ruleDetails = [{ ruleCode: "8", ruleHead: "", ruleTail: "" }];
      this.ruleShow = true;
    },

    // 查看
    examine(pkId) {
      this.examineShow = true;
      this.tabPosition = "1";
      this.$api.customOrderRuleById({ pkId }).then(res => {
        if (res.code == 200) {
          this.checkList = res.data.customOrderSets;
          this.ruleDetails = res.data.customOrderRuleSets;
          this.ruleData.allowModify = res.data.allowModify;
          this.ruleData.limitNum = res.data.limitNum;
          this.ruleData.ruleName = res.data.ruleName;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 编辑
    editOrder(pkId) {
      this.fkRuleId = pkId;
      this.$api.customOrderRuleById({ pkId }).then(res => {
        if (res.code == 200) {
          this.ruleTittle = "编辑单号规则";
          this.ruleShow = true;
          this.ruleDetails = res.data.customOrderRuleSets;
          this.ruleData.allowModify = res.data.allowModify;
          this.ruleData.limitNum = res.data.limitNum;
          this.ruleData.ruleName = res.data.ruleName;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 配置单据
    configuration(pkId) {
      this.fkRuleId = pkId;
      this.$api.customOrderRuleById({ pkId }).then(res => {
        if (res.code == 200) {
          this.checkList = res.data.customOrderSets;
          this.configurationShow = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 删除
    deleteOrder(pkId) {
      this.$confirm("确定删除该单号生成规则？", "删除询问", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api
          .customOrderRuleDelete({ pkId })
          .then(res => {
            if (res.code === 200) {
              this.$message.success(res.msg);
              this.queryData();
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {});
      });
    },
    // 配置单弹窗提交
    ruleSubmit() {
      console.log(this.checkList);
      let data = {
        customOrderSets: this.checkList,
        fkRuleId: this.fkRuleId
      };
      this.$api.customOrderRuleDeploy(data).then(res => {
        if (res.code == 200) {
          this.queryData();
          this.configurationShow = false;
          this.$message.success(res.msg);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 增加编码规则
    addDetails() {
      if (this.ruleDetails.length == 10) {
        return this.$message.warning("最多只能增加10条规则");
      }
      this.ruleDetails.push({ ruleCode: "", ruleHead: "", ruleTail: "" });
    },
    // 移除编码规则
    removeDetails(idx) {
      if (this.ruleDetails.length == 1) {
        return (this.ruleDetails = [{ ruleCode: "8", ruleHead: "", ruleTail: "" }]);
      }
      this.ruleDetails.splice(idx, 1);
    },
    // 新增修改提交
    submitRule(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let data = this.ruleData;
          data.fkOrgId = this.searchData.fkOrgId;
          data.customOrderRuleSets = this.ruleDetails;
          data.customOrderRuleSets.forEach((item, idx) => {
            item.sortval = idx;
          });
          if (this.ruleTittle == "新增单号规则") {
            this.$api.customOrderRuleAdd(data).then(res => {
              if (res.code == 200) {
                this.ruleShow = false;
                this.queryData();
                this.$message.success(res.msg);
              } else {
                this.$message.warning(res.msg);
              }
            });
          } else {
            data.pkId = this.fkRuleId;
            this.$api.customOrderRuleUpdate(data).then(res => {
              if (res.code == 200) {
                this.ruleShow = false;
                this.queryData();
                this.$message.success(res.msg);
              } else {
                this.$message.warning(res.msg);
              }
            });
          }
        } else {
          return false;
        }
      });
    },
    handleCurrentChange(val) {
      this.searchData.pageNum = val;
    },
    handleSizeChange(val) {
      this.searchData.size = val;
    }
  }
};
</script>

<style lang="scss" scoped>
.form-data {
  display: flex;
  align-items: center;
  /deep/ .el-form-item {
    margin-bottom: 0 !important;
  }
}
.seek {
  margin-left: 10px;
}
.btn-right {
  position: absolute;
  right: 40px;
}
.headline {
  background: #ccc;
  font-size: 16px;
  .item {
    padding: 0 20px;
  }
}
.rule {
  margin-left: 25px;
  font-size: 14px;
  line-height: 40px;
}
.rule-numerical {
  margin: 5px;
}
.weight-600 {
  font-weight: 600;
}
.rule-check-item {
  display: block;
  line-height: 30px;
}
/deep/ .el-dialog__header {
  background: #ccc;
}
.dialog-footer {
  margin-top: 20px;
  text-align: center;
}
.numerical-order {
  display: inline-block;
  width: 2em;
  text-align: right;
}

.border-no {
  padding: 0;
  border: none;
}
.color-red {
  color: red;
}
.color-green {
  color: green;
}
.wh-222 {
  width: 222px;
}
.wh-90 {
  width: 91px;
}
.wh-203 {
  width: 203px;
}
.ml-20 {
  margin-left: 20px;
}
.wh-300 {
  width: 300px;
}
.examineShow-box {
  height: 520px;
  padding: 20px;
  border: 1px solid rgb(204, 204, 204);
  overflow-y: auto;
}
.row-height {
  margin: 20px;
}
</style>
