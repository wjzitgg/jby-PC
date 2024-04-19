<!--付费模式 -->
<template>
  <div class="app-container">
    <div class="tab-container" style="margin-top:12px">
      <div class="charge-bitton">
        <el-button type="primary" size="mini" class="search-mr" v-has="'system:charging:add'" @click="addCharge">新增收费模式</el-button>
      </div>
      <el-table :tooltip-effect="'light'" :data="chargeModeData" border height="500px" style="width: 100%" v-loading="loading" :header-cell-style="{ background: '#f1f6ff', 'text-align': 'center' }" :cell-style="{ align: 'center' }">
        <el-table-column align="center" label="序号" min-width="60">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (params.pageNum - 1) * params.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="roleTypeName" label="系统角色" min-width="100"></el-table-column>
        <el-table-column align="center" prop="paidService" label="基本费用" min-width="90">
          <template slot-scope="scope"> {{ scope.row.chargeMoney }}/月 </template>
        </el-table-column>
        <el-table-column align="center" prop="paidServiceEndTime" label="结算费用" min-width="80">
          <template slot-scope="scope">
            <div v-for="(item, idx) in scope.row.chargingDetails" :key="idx">
              <span v-if="item.benginAmount != 0">{{ item.benginAmount }}万元~</span>{{ item.endAmount }}万元 按{{ item.chargeRate }}%计算
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="remark" label="备注" min-width="80" show-overflow-tooltip></el-table-column>
        <el-table-column prop="alarmLevel" align="center" label="操作" min-width="150">
          <template slot-scope="scope">
            <el-button size="mini" v-has="'system:charging:query'" @click.native="examineCharge(scope.row)">查看</el-button>
            <el-button type="primary" v-has="'system:charging:edit'" size="mini" @click.native="editCharge(scope.row)">编辑</el-button>
            <el-button type="danger" v-has="'system:charging:delete'" size="mini" @click.native="deleteCharge(scope.row)">删除</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <table-paging :current-page="params.pageNum" :page-size="params.pageSize" :total="modetotalCount" @handleSizeChange="pageSizeChange" @handleCurrentChange="pageCurrentChange"></table-paging>
    </div>
    <el-dialog :title="chargeShowTitle" :visible.sync="chargeShow" width="500px" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="charge-box">
        <el-form :model="form" :rules="rules" ref="chargeShowForm" :hide-required-asterisk="false" style="padding-top: 20px; padding-bottom: 20px; padding-left: 0">
          <el-form-item label="系统角色" prop="roleType" label-width="80px">
            <el-select v-model="form.roleType" placeholder="请选择" style="width: 100%" size="mini" :disabled="chargeShowTitle == '查看收费模式' || chargeShowTitle == '编辑收费模式'">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="基本月费" prop="chargeMoney" label-width="80px">
            <el-input v-model="form.chargeMoney" type="number" size="mini" @keydown.native="keyDown($event, 1)" :disabled="chargeShowTitle == '查看收费模式'" @input="oninput" autocomplete="off">
              <template slot="append">元/月</template>
            </el-input>
          </el-form-item>
          <el-form-item label="结算费用" label-width="80px">
            <el-row v-for="(item, idx) in form.chargingDetailAdds" :key="idx">
              <el-col :span="8">
                <el-col :span="14">
                  <el-form-item prop="benginAmount" class="chargeRate-input">
                    <el-input v-model="item.benginAmount" :disabled="chargeShowTitle == '查看收费模式'" type="number" size="mini" @keydown.native="keyDown($event, 1)" @input="oninput" autocomplete="off"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="9" style="text-align: center">万元~</el-col>
              </el-col>
              <el-col :span="7">
                <el-col :span="16">
                  <el-form-item prop="endAmount" class="chargeRate-input">
                    <el-input v-model="item.endAmount" :disabled="chargeShowTitle == '查看收费模式'" type="number" size="mini" @keydown.native="keyDown($event, 1)" @input="oninput" autocomplete="off"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8" style="text-align: center">万元</el-col>
              </el-col>
              <el-col :span="9">
                <el-col :span="3" style="text-align: center">收</el-col>
                <el-col :span="12">
                  <el-form-item prop="chargeRate" class="chargeRate-input">
                    <el-input @input="oninput2($event, idx)" v-model="item.chargeRate" :disabled="chargeShowTitle == '查看收费模式'" type="number" size="mini" @keydown.native="keyDown($event, 1)" autocomplete="off"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="9" style="text-align: center"
                  >%
                  <el-button style="margin:0;padding:0" size="mini" icon="el-icon-plus" circle v-if="idx == 0 && chargeShowTitle != '查看收费模式'" @click.native="addClearing"></el-button>
                  <el-button style="margin:0;padding:0" type="danger" size="mini" icon="el-icon-minus" circle v-if="idx != 0 && chargeShowTitle != '查看收费模式'" @click.native="removeClearing(idx)"></el-button>
                </el-col>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="备注" prop="chargeMoney" label-width="80px">
            <el-input v-model="form.remark" type="textarea" style="resize: none" :rows="3" maxlength="100" :disabled="chargeShowTitle == '查看收费模式'" placeholder="请输入内容" autocomplete="off"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer" style="text-align: right" v-if="chargeShowTitle != '查看收费模式'">
        <el-button type="info" size="mini" @click="chargeShow = false">取 消</el-button>
        <el-button type="primary" size="mini" @click="submit('chargeShowForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import pictureUpload from "@/components/pictureUpload";
import moment from "moment";
export default {
  name: "payList",
  components: {
    pictureUpload
  },
  data() {
    return {
      rules: {},
      options: [
        {
          value: "6",
          label: "供应商"
        },
        {
          value: "7",
          label: "分包单位"
        },
        {
          value: "8",
          label: "劳务工人"
        }
      ],
      loading: false,
      chargeModeData: [],
      params: {
        pageNum: 1,
        pageSize: 10
      },
      modetotalCount: 0,
      chargeShow: false,
      chargeShowTitle: "新增收费模式",
      form: {
        chargeMoney: null, // 基本月费
        roleType: null, // 系统类型
        chargingDetailAdds: [{ benginAmount: null, endAmount: null, chargeRate: null }], // 收费明细集
        remark: null
      }
    };
  },
  mounted() {
    this.getChargingModePageList(this.params);
  },
  methods: {
    deleteCharge(row) {
      const _this = this;
      _this
        .$confirm("确定删除该收费模式？", "删除确认", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          const modeId = row.pkId;
          _this.$api.delChargingModeById({ modeId }).then(resp => {
            if (resp.code == 200) {
              _this.$message({
                type: "success",
                message: "删除成功！"
              });
              this.getChargingModePageList(this.params);
            } else {
              _this.$message({
                type: "error",
                message: res.msg
              });
            }
          });
        })
        .catch(() => {});
    },
    editCharge(row) {
      this.chargeShowTitle = "编辑收费模式";
      this.form.chargeMoney = row.chargeMoney;
      this.form.roleType = row.roleType + "";
      this.form.remark = row.remark;
      const arr = [];
      row.chargingDetails.forEach(item => {
        arr.push({ benginAmount: item.benginAmount, chargeRate: item.chargeRate, endAmount: item.endAmount });
      });
      this.form.chargingDetailAdds = arr;
      this.chargeShow = true;
      this.form.pkId = row.pkId;
    },
    examineCharge(row) {
      this.chargeShowTitle = "查看收费模式";
      this.form.chargeMoney = row.chargeMoney;
      this.form.remark = row.remark;
      this.form.roleType = row.roleType + "";
      this.form.chargingDetailAdds = row.chargingDetails;
      this.chargeShow = true;
      // console.log(row);
    },
    addClearing() {
      this.form.chargingDetailAdds.push({ benginAmount: null, endAmount: null, chargeRate: null });
    },
    removeClearing(idx) {
      this.form.chargingDetailAdds.splice(idx, 1);
    },
    // 提交
    submit() {
      this.$refs.chargeShowForm.validate(valid => {
        if (valid) {
          let status = false;
          this.form.chargingDetailAdds.forEach((item, idx) => {
            if (idx != 0) {
              if (this.form.chargingDetailAdds[idx].benginAmount < this.form.chargingDetailAdds[idx - 1].endAmount) {
                this.$message.warning("下级开始金额不能小于上级结束金额");
                status = true;
              }
            } else if (item.endAmount == null || item.benginAmount == null || item.chargeRate == null) {
              status = true;
              this.$message.warning("结算费用不能为空");
            } else if (item.endAmount.length == 0 || item.benginAmount.length == 0 || item.chargeRate.length == 0) {
              status = true;
              this.$message.warning("结算费用不能为空");
            } else if (item.endAmount < item.benginAmount) {
              status = true;
              this.$message.warning("开始费用不能大于结束费用");
            } else if (item.endAmount == item.benginAmount) {
              status = true;
              this.$message.warning("开始结束费用不能一致");
            }
          });
          if (status) {
            return;
          }
          if (this.chargeShowTitle == "编辑收费模式") {
            const data = {
              chargeMoney: this.form.chargeMoney,
              pkId: this.form.pkId,
              chargingDetailUpdates: this.form.chargingDetailAdds,
              remark: this.form.remark
            };

            this.$api.editChargingMode(data).then(res => {
              if (res.code == 200) {
                this.$message.success("编辑成功");
                this.getChargingModePageList(this.params);
                this.chargeShow = false;
              } else {
                this.$message.warning(res.msg);
              }
            });
          } else {
            this.$api.addChargingMode(this.form).then(res => {
              if (res.code == 200) {
                this.$message.success("新增成功");
                this.getChargingModePageList(this.params);
                this.chargeShow = false;
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
    addCharge() {
      this.form = {
        chargeMoney: null, // 基本月费
        roleType: null, // 系统类型
        chargingDetailAdds: [{ benginAmount: null, endAmount: null, chargeRate: null }], // 收费明细集
        remark: null
      };
      this.chargeShow = true;
      this.chargeShowTitle = "新增收费模式";
    },

    getChargingModePageList(data) {
      const self = this;
      self.loading = true;
      (async data => {
        const res = await self.$api.getChargingModePageList(data);

        if (res && res.code == 200) {
          const options = {
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
          this.chargeModeData = res.data.records;
          this.modetotalCount = parseInt(res.data.total);
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
    // 页数改变事件
    pageSizeChange(pageSize) {
      this.params.pageSize = pageSize;
      this.getChargingModePageList(this.params);
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 页码改变事件
    pageCurrentChange(currentPage) {
      this.params.pageNum = currentPage;
      this.getChargingModePageList(this.params);
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 数字输入框禁止输入事件
    keyDown(e, type) {
      const key = e.key;
      if (type === 1) {
        if (key === "e" || key === "-") {
          e.returnValue = false;
          return false;
        }
      } else {
        if (key === "e" || key === "." || key === "-") {
          e.returnValue = false;
          return false;
        }
      }
      return true;
    },
    oninput(e) {
      this.$nextTick(() => {
        let val = e;
        val = val.replace(/[^\d.]/g, ""); // 清除"数字"和"."以外的字符
        val = val.replace(/\.{2,}/g, "."); // 只保留第一个. 清除多余的
        val = val.replace(/^0+\./g, "0.");
        val = val.match(/^0+[1-9]+/) ? (val = val.replace(/^0+/g, "")) : val;
        val = val.match(/^\d*(\.?\d{0,2})/g)[0] || "";
        if (val.includes(".")) {
          this.moneyMaxLeng2 = 15;
        } else {
          this.moneyMaxLeng2 = 12;
        }
      });
    },
    oninput2(e, idx) {
      this.$nextTick(() => {
        let val = e;
        val = val.replace(/[^\d.]/g, ""); // 清除"数字"和"."以外的字符
        val = val.replace(/\.{2,}/g, "."); // 只保留第一个. 清除多余的
        val = val.replace(/^0+\./g, "0.");
        val = val.match(/^0+[1-9]+/) ? (val = val.replace(/^0+/g, "")) : val;
        val = val.match(/^\d*(\.?\d{0,2})/g)[0] || "";
        this.form.chargingDetailAdds[idx].chargeRate = val;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/ .el-dialog__header {
  // background-color: #d7d7d7 !important;
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409eff;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.el-row-data {
  display: flex;
  flex-wrap: wrap;
}
.pay-header {
  position: relative;
  .search-mr {
    position: absolute;
    right: 8px;
  }
}
.charge-bitton {
  text-align: right;
}
.charge-box {
  height: 400px;
  overflow: auto;
}
::-webkit-scrollbar {
  width: 5px;
  color: #fff;
  background-color: #fcfcfc;
}
::-webkit-scrollbar-thumb {
  background-color: rgb(209, 209, 209);
}
.chargeRate-input {
  /deep/ .el-input__inner {
    padding: 0 !important ;
    text-align: center;
  }
}
</style>
