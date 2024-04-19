<template>
  <div class="app-container">
    <div class="search-bar-box">
      <el-button type="primary" style="margin" size="mini" @click="addUnit"
        v-has="'system:charging:add'">新增收费模式</el-button>
    </div>
    <div class="tab-container">
      <div class="table-data" style="height: 82%">
        <el-table :data="tableData" stripe ref="tables" style="width: 100%" v-loading="loading" :tooltip-effect="'light'"
          :header-cell-style="{ background: '#f1f6ff' }" :cell-style="{ align: 'center' }">
          <el-table-column align="center" label="序号" min-width="60">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (listQuery.pageNum - 1) * listQuery.pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>

          <el-table-column align="center" prop="roleTypeName" label="系统角色" min-width="120"> </el-table-column>
          <el-table-column align="center" prop="chargeMoney" label="基本费用" min-width="120">
            <template slot-scope="{ row }">
              <span>{{ row.chargeMoney }}元/月</span>
              <!-- <span v-if="scope.row.modeType == 1">按年收费</span>
            <span v-if="scope.row.modeType == 2">按月收费</span>
            <span v-if="scope.row.modeType == 3">按项目收费</span> -->
            </template>
          </el-table-column>
          <el-table-column align="center" prop="remark" label="收费方式" min-width="120">
            <template slot-scope="{ row }">
              <!-- <span v-if="scope.row.modeType == 1">{{ scope.row.chargeMoney }}元{{ scope.row.changeUnit }}年</span>
            <span v-if="scope.row.modeType == 2">{{ scope.row.chargeMoney }}元{{ scope.row.changeUnit }}个月</span>
            <span v-if="scope.row.modeType == 3">{{ scope.row.chargeMoney }}元{{ scope.row.changeUnit }}个项目</span> -->
              <div v-for="(item, index) in row.chargingDetails" :key="index">{{ item.benginAmount }}~{{ item.endAmount
              }}万元
                按{{ item.chargeRate }}%计算</div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="remark" label="备注" min-width="180" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" fixed="right" prop="alarmLevel" label="操作" width="260">
            <template slot-scope="scope">
              <el-button type="primary" plain size="mini" v-has="'system:charging:query'"
                @click.native="examine(scope.row)">查看</el-button>
              <el-button type="success" size="mini" plain v-has="'system:charging:edit'" @click.native="edit(scope.row)">编辑</el-button>
              <el-button type="danger" plain v-has="'system:charging:delete'" size="mini"
                @click.native="remove(scope.row)">删除</el-button>
            </template>
          </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <table-paging :current-page="listQuery.pageNum" :page-size="listQuery.pageSize" :total="totalCount"
        @handleSizeChange="pageSizeChange" @handleCurrentChange="pageCurrentChange"></table-paging>
    </div>
    <el-dialog :title="addTitle" :visible.sync="show" width="500px" v-dialogDrag :close-on-click-modal="false"
      :close-on-press-escape="false" v-loading="loading1">
      <el-form :model="form" :rules="rules" ref="form" :hide-required-asterisk="false" class="dialog-form">
        <el-form-item label="系统角色" prop="role" :label-width="formLabelWidth">
          <el-select v-model="form.role" placeholder="请选择" style="width: 100%" :disabled="showType != 1" size="mini">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="基本费用" prop="chargeMoney" :label-width="formLabelWidth">
          <el-input v-model="form.chargeMoney" type="number"  style="vertical-align: middle;" size="mini" @blur="chargeMoneyBlur"
            @keydown.native="keyDown($event, 1)" @input="oninput"   autocomplete="off" :disabled="showType == 2">
            <template slot="append">元/月</template>
          </el-input>
        </el-form-item>
        <el-form-item label="结算费用" :label-width="formLabelWidth" class="charging-box">
          <div style=" max-height: 101px; overflow: auto;">
            <el-row v-for="(item, index) in chargingDetails" :key="index" style="margin-bottom: 12px;">
              <el-col :span="7">
                <el-col :span="14">
                  <el-form-item>
                    <el-input d v-model="item.benginAmount" type="number" size="mini" @keydown.native="keyDown($event, 1)"
                      autocomplete="off" disabled></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="10" style="text-align: center">万元~</el-col>
              </el-col>
              <el-col :span="6">
                <el-form-item prop="endAmount">
                  <el-input v-model="item.endAmount"  @input="floatInput(item.endAmount,index)" @blur="endAmountBlur(index, item.endAmount, item.benginAmount)"
                    size="mini" autocomplete="off" type="number" @keydown.native="keyDown($event, 2)"
                    :disabled="showType == 2"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="3" style="text-align: center">万元 收</el-col>
              <el-col :span="4">
                <el-form-item prop="chargeRate">
                  <el-input v-model="item.chargeRate" size="mini" autocomplete="off" type="number"
                    :disabled="showType == 2"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="2" style="text-align: center">%</el-col>
              <el-col :span="2" style="text-align: center" v-if="showType != 2">
                <el-button v-if="index == 0" icon="el-icon-plus" circle size="mini" @click="chargingAdd"></el-button>
                <el-button v-else icon="el-icon-minus" circle size="mini" @click="chargingRemove(index)"></el-button>
              </el-col>
            </el-row>
          </div>
        </el-form-item>
        <el-form-item label="备注" prop="remark" :label-width="formLabelWidth">
          <el-input v-model="form.remark" type="textarea" :disabled="showType == 2" maxlength="100" :rows="3"
            placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item> </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="showType != 2">
        <el-button size="mini" @click="show = false">取 消</el-button>
        <el-button type="primary" size="mini" @click="submit('form')">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "chargeMode",

  data() {
    return {
      totalCount: 0,
      //搜索请求参数
      listQuery: {
        pageNum: 1,
        pageSize: 10
        // param: {}
      },
      tableData: [],
      maxHeight: 0,
      show: false,
      formLabelWidth: "80px",
      form: {
        role: null,
        price: null,
        specification: null,
        unit: null,
        remark: null,
        pkId: null
      },
      addTitle: "技术规范",
      rules: {
        role: [
          {
            required: true,
            message: "系统角色不能为空",
            trigger: ["change", "blur"]
          }
        ],
        chargeMoney: [
          {
            required: true,
            message: "基本费用不能为空",
            trigger: ["change", "blur"]
          }
        ]
      },
      showType: null,
      options: [
        // { value: 1, label: "系统代理商" },
        // { value: 2, label: "建设单位" },
        // { value: 3, label: "监理公司" },
        // { value: 4, label: "施工单位" },
        // { value: 5, label: "项目部" },
        { value: 6, label: "供应商" },
        { value: 7, label: "分包单位" },
        { value: 8, label: "劳务工人" }
        // { value: 9, label: "设计院" }
      ],
      // options1: [
      //   { value: 1, label: "年" },
      //   { value: 2, label: "月" },
      //   { value: 3, label: "项目" }
      // ],
      loading: false,
      loading1: false,
      moneyMaxLeng2: 12,
      chargingDetails: [
        {
          benginAmount: "0",
          chargeRate: "",
          endAmount: ""
        }
      ]
    };
  },

  mounted() {
    this.getChargingModePageList(this.listQuery);
  },
  methods: {
    floatInput(val,idx) {
      let checkPlan = "" + val;
      checkPlan = checkPlan
        .replace(/[^\d.]/g, "") // 清除“数字”和“.”以外的字符
        .replace(/\.{2,}/g, ".") // 只保留第一个. 清除多余的
        .replace(/^\./g, "") // 保证第一个为数字而不是.
        .replace(".", "$#$")
        .replace(/\./g, "")
        .replace("$#$", ".");
      if (checkPlan.indexOf(".") < 0 && checkPlan !== "") {
        // 以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
        checkPlan = parseFloat(checkPlan) + "";
      } else if (checkPlan.indexOf(".") >= 0) {
        checkPlan = checkPlan.replace(/^()*(\d+)\.(\d\d).*$/, "$1$2.$3"); // 只能输入两个小数
      }
      console.log(checkPlan);
      this.$nextTick(() => (this.form.weight = checkPlan * 1));
      return this.chargingDetails[idx].endAmount = checkPlan;
    },
    chargeMoneyBlur() {
      // this.chargingDetails[0].benginAmount = this.form.chargeMoney;
    },
    endAmountBlur(idx, end, and) {
      console.log(idx);

      if (end - 0 < and - 0) {
        this.chargingDetails[idx].endAmount = "";
        return this.$message.warning("结束标准金额不能小于起始标准金额");
      }
      if (this.chargingDetails.length - 1 > idx) {
        this.chargingDetails[this.chargingDetails.length - 1].benginAmount = end;
      }
    },
    chargingAdd() {
      if (this.chargingDetails[this.chargingDetails.length - 1].benginAmount.length == 0) {
        return this.$message.warning("起始标准金额（万元）");
      }
      if (this.chargingDetails[this.chargingDetails.length - 1].endAmount.length == 0) {
        return this.$message.warning("结束标准金额（万元）");
      }
      if (this.chargingDetails[this.chargingDetails.length - 1].chargeRate.length == 0) {
        return this.$message.warning("请输入收取费率（千分之几)");
      }
      this.chargingDetails.push({
        benginAmount: this.chargingDetails[this.chargingDetails.length - 1].endAmount,
        chargeRate: "",
        endAmount: ""
      });
    },
    chargingRemove(idx) {
      this.chargingDetails.splice(idx, 1);
    },
    getChargingModePageList(data) {
      const self = this;
      self.loading = true;
      (async data => {
        let res = await self.$api.getChargingModePageList(data);

        if (res && res.code == 200) {
          let options = {
            1: "代理商",
            2: "建设单位",
            3: "监理公司",
            4: "施工单位",
            5: "项目部",
            6: "供应商",
            7: "分包单位",
            8: "劳务工人",
            9: "设计院"
          };
          res.data.records.forEach(item => {
            item.roleTypeName = options[item.roleType];
          });
          this.tableData = res.data.records;
          this.totalCount = parseInt(res.data.total);
          self.loading = false;
        } else {
          self.loading = false;
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      })(data);
    },

    // 新增接口
    async addChargingMode(data) {
      //创建模板定制调用接口
      let res = await this.$api.addChargingMode(data);
      if (res.code == 200) {
        this.show = false;
        this.getChargingModePageList(this.listQuery);
        this.loading1 = false;
        this.$message({
          type: "success",
          message: "新增成功！"
        });
      } else {
        this.loading1 = false;
        this.$message({
          type: "error",
          message: res.msg
        });
      }
      //根据接口返回值判断
    },
    // 新增接口
    async editChargingMode(data) {
      //创建模板定制调用接口
      let res = await this.$api.editChargingMode(data);
      if (res.code == 200) {
        this.show = false;
        this.getChargingModePageList(this.listQuery);
        this.loading1 = false;
        this.$message({
          type: "success",
          message: "修改成功！"
        });
      } else {
        this.loading1 = false;
        this.$message({
          type: "error",
          message: res.msg
        });
      }
      //根据接口返回值判断
    },
    //页数改变事件
    pageSizeChange(pageSize) {
      this.listQuery.pageSize = pageSize;
      this.listQuery.pageNum = 1;
      this.getChargingModePageList(this.listQuery);
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    //页码改变事件
    pageCurrentChange(currentPage) {
      this.listQuery.pageNum = currentPage;
      this.getChargingModePageList(this.listQuery);
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },

    //编辑
    edit(rowData) {
      let data = JSON.stringify(rowData)
      let row = JSON.parse(data)
      this.show = true;
      this.showType = 3;
      this.addTitle = "编辑收费模式";
      this.form = {
        role: row.roleType,
        price: row.chargeMoney,
        specification: row.changeUnit,
        unit: row.modeType,
        remark: row.remark,
        pkId: row.pkId,
        chargeMoney: row.chargeMoney
      };
      this.chargingDetails = row.chargingDetails;
      if (this.chargingDetails == null || this.chargingDetails.length == 0) {
        this.chargingDetails = [
          {
            benginAmount: this.form.chargeMoney,
            chargeRate: "",
            endAmount: ""
          }
        ]
      }
    },

    //查看
    examine(row) {
      this.show = true;
      this.showType = 2;
      this.addTitle = "查看收费模式";
      this.form = {
        role: row.roleType,
        price: row.chargeMoney,
        specification: row.changeUnit,
        unit: row.modeType,
        remark: row.remark,
        pkId: row.pkId,
        chargeMoney: row.chargeMoney
      };
      this.chargingDetails = row.chargingDetails;
    },
    //删除
    remove(row) {
      const _this = this;
      _this
        .$confirm("确认删除该收费模式?", "删除确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          let modeId = row.pkId;
          _this.$api.delChargingModeById({ modeId }).then(resp => {
            if (resp.code == 200) {
              _this.$message({
                type: "success",

                message: "删除成功！"
              });
              // 删除之后再次刷新一下数据
              _this.getChargingModePageList(this.listQuery);
            } else {
              _this.$message({
                type: "error",
                message: res.msg
              });
            }
          });
        })
        .catch(() => { });
    },
    //
    async delChargingModeById(modeId) {
      const _this = this;
      let result = await _this.$api.delChargingModeById(modeId);
      return result;
    },
    //新增
    addUnit() {
      this.show = true;
      this.showType = 1;
      this.addTitle = "新增收费模式";
      this.reset();
      // 是
      if (this.$refs.form != undefined) {
        this.$refs["form"].resetFields();
      }
      this.chargingDetails = [
        {
          benginAmount: "0",
          chargeRate: "",
          endAmount: ""
        }
      ];
    },
    //确认提交
    submit(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading1 = true;
          let data = {
            // changeUnit: this.form.specification,
            chargeMoney: this.form.chargeMoney,
            // modeType: this.form.unit,
            roleType: this.form.role,
            remark: this.form.remark,
            chargingDetailAdds: this.chargingDetails
          };
          let status1 = false 
          let status2 = false 
          let status3 = false 
          data.chargingDetailAdds.forEach(item=>{
            if(item.benginAmount ==item.endAmount){
              status1 = true
            }
            if(item.endAmount.length == 0 ){
              status2 = true
            }
            if(item.chargeRate.length == 0 ){
              status3 = true
            }
          })
          if(status1){
            this.loading1 = false;
            return this.$message.warning("结算费用开始结束不能一致")
          }
          if(status2){
            this.loading1 = false;
            return this.$message.warning("结算费用不能为空")
          }
          if(status3){
            this.loading1 = false;
            return this.$message.warning("百分比不能为空")
          }
          // chargeMoney role roleType
          if (this.showType == 1) {
            //新增确认
            this.addChargingMode(data);
          } else if (this.showType == 2) {
            //查看确认
          } else if (this.showType == 3) {
            data.pkId = this.form.pkId;
            //编辑确认
            this.editChargingMode(data);
          }
        } else {
          return false;
        }
      });
    },
    reset() {
      this.form = {
        role: null,
        price: null,
        specification: null,
        unit: null,
        remark: null
      };
    },
    // 数字输入框禁止输入事件
    keyDown(e, type) {
      let key = e.key;
      if (type === 1) {
        if (key === "e" || key === "-") {
          e.returnValue = false;
          return false;
        }
      } else {
        if (key === "e"  || key === "-") {
          e.returnValue = false;
          return false;
        }
      }
      return true;
    },
    oninput(e) {
      // this.$nextTick(() => {
      //   let val = e;
      //   val = val.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
      //   val = val.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
      //   val = val.replace(/^0+\./g, "0.");
      //   val = val.match(/^0+[1-9]+/) ? (val = val.replace(/^0+/g, "")) : val;
      //   val = val.match(/^\d*(\.?\d{0,2})/g)[0] || "";
      //   if (val.includes(".")) {
      //     this.moneyMaxLeng2 = 15;
      //   } else {
      //     this.moneyMaxLeng2 = 12;
      //   }
      //   this.form.price = val;
      // });
      let checkPlan = "" + e;
      checkPlan = checkPlan
        .replace(/[^\d.]/g, "") // 清除“数字”和“.”以外的字符
        .replace(/\.{2,}/g, ".") // 只保留第一个. 清除多余的
        .replace(/^\./g, "") // 保证第一个为数字而不是.
        .replace(".", "$#$")
        .replace(/\./g, "")
        .replace("$#$", ".");
      if (checkPlan.indexOf(".") < 0 && checkPlan !== "") {
        // 以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
        checkPlan = parseFloat(checkPlan) + "";
      } else if (checkPlan.indexOf(".") >= 0) {
        checkPlan = checkPlan.replace(/^()*(\d+)\.(\d\d).*$/, "$1$2.$3"); // 只能输入两个小数
      }
      console.log(checkPlan);
      this.$nextTick(() => (this.form.weight = checkPlan * 1));
      return this.form.chargeMoney = checkPlan;
    }
  }
};
</script>

<style lang="scss" scoped>
// /deep/ .el-dialog__header {
//    background-color: #ccc !important;
// }
.charging-box {
  ::-webkit-scrollbar {
    width: 5px;
    color: #fff;
    background-color: #fcfcfc;
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgb(209, 209, 209);
  }

  .left-header {
    position: relative;
    margin: 15px 15px 38px 15px;
    height: 2px;
    background: #ccc;

    .left_title {
      position: absolute;
      left: 100px;
      z-index: 2;
      top: -11px;
      padding: 0 6px 0 6px;
      font-size: 16px;
      text-align: center;
      background: #fff;
    }
  }
}
</style>
