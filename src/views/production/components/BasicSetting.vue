<template>
  <el-dialog title="结算龄期" top="15vw" :close-on-press-escape="false" :visible="basicDialog" @close="handleClose2(1)" width="30%" center v-dialogDrag :close-on-click-modal="false" v-loading="loading">
    <div class="dialog-form">
      <div class="dialog-item">
        <!-- <div class="left">混泥土生产方案</div> -->
        <div :class="{ left: dialogType === 1, left2: dialogType === 2 }">业主结算混凝土龄期</div>
        <div class="right r1">
          <!-- <el-radio-group v-model="schemeRadio" :disabled="orgType !== 5">
          <el-radio :label="0">预拌（手工录入到生产流程）</el-radio>
          <el-radio :label="1">自拌（本系统关联生成流程）</el-radio>
          <el-radio :label="2">自拌（其他系统，插件读取数据到生产流程）</el-radio>
          <el-radio :label="3">自拌（其他系统，手工录入到生产流程）</el-radio>
        </el-radio-group> -->
          <el-input size="mini" v-model.number="settingTime" class="wh-200" @input="limitInput($event, 1)" v-if="dialogType === 2"></el-input>
          <span v-if="dialogType === 1">{{ settingTime }}</span>
          <span class="day">天</span>
        </div>
      </div>
      <div class="dialog-item">
        <div :class="{ left: dialogType === 1, left2: dialogType === 2 }">分包计价混凝土龄期</div>
        <div class="right r1">
          <el-input size="mini" v-model.number="subTime" class="wh-200" @input="limitInput($event, 2)" v-if="dialogType === 2"></el-input>
          <span v-if="dialogType === 1">{{ subTime }}</span>
          <span class="day">天</span>
        </div>
      </div>
      <!-- <div class="dialog-item">
      <div :class="{left:dialogType===1,left2:dialogType===2}">材料用量录入设置</div>
      <div class="right r1">
        <el-select v-model="dosage" size="mini" v-if="dialogType===2">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <span v-if="dialogType===1">{{dosage===0?'物资供给参考':dosage===1?'物资供给完全控制':''}}</span>
      </div>
    </div> -->
    </div>
    <!-- <div class="dialog-item">
      <div class="left">混泥土验收龄期</div>
      <div class="right r2">
        <el-radio-group v-model="ageRadio" :disabled="orgType !== 5">
          <el-radio :label="0">0天</el-radio>
          <el-radio :label="1">7天</el-radio>
          <el-radio :label="2">14天</el-radio>
          <el-radio :label="3">28天</el-radio>
          <el-radio :label="4">56天</el-radio>
        </el-radio-group>
      </div>
    </div> -->
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" class="el-button-primary" @click="handleEdit" v-if="dialogType === 1" v-has="'production:setting:baseEdit'">设 置</el-button>
      <el-button type="primary" class="el-button-primary" @click="handleClose" v-if="dialogType === 2">保 存</el-button>

      <el-button type="primary" plain @click="handleClose2(2)">{{ dialogType == 1 ? "关 闭" : "取 消" }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    basicDialog: {
      type: Boolean,
      default: false
    },
    orgType: {
      type: Number
    },
    fkOrgId: ""
  },
  data() {
    return {
      //   生产方案单选框
      dialogType: 1, //1为预览，2为编辑
      schemeRadio: 4,
      ageRadio: 1,
      loading: false,
      data: [],
      settingTime: "",
      subTime: "",
      dosage: "",
      options: [
        { label: "物资供给参考", value: 0 },
        { label: "物资供给完全控制", value: 1 }
      ]
    };
  },
  methods: {
    limitInput(e, type) {
      if (type == 1) {
        this.settingTime = this.$limitInputNumber(e, 99, 0) - 0;
      } else {
        this.subTime = this.$limitInputNumber(e, 99, 0) - 0;
      }
    },
    handleClose() {
      let baseSetAdds = [
        {
          concreteAge: this.settingTime - 0,
          concreteProdScheme: 0
        },
        {
          concreteAge: this.subTime - 0,
          concreteProdScheme: 1
        }
        // {
        //   concreteAge: this.dosage,
        //   concreteProdScheme: 2
        // }
      ];
      this.data.forEach(item => {
        baseSetAdds.forEach(item2 => {
          if (item.concreteProdScheme === item2.concreteProdScheme && !!item.pkId) {
            item2.pkId = item.pkId;
          }
        });
      });
      this.loading = true;
      this.$api
        .addSetData(baseSetAdds)
        .then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg);
            this.dialogType = 1;
            // this.$emit("update:basicDialog", false);
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    handleClose2(type) {
      if (type === 1) {
        this.$emit("update:basicDialog", false);
        this.dialogType = 1;
      } else if (type === 2) {
        if (this.dialogType === 1) {
          this.$emit("update:basicDialog", false);
        } else if (this.dialogType === 2) {
          this.dialogType = 1;
          this.queryBasics();
        }
      }
    },
    handleEdit() {
      this.dialogType = 2;
    },
    // 获取基础数据
    queryBasics() {
      this.$api
        .queryBasics({ fkOrgId: this.fkOrgId })
        .then(res => {
          if (res.code === 200) {
            // this.ageRadio = res.data.concreteAge;
            // this.schemeRadio = res.data.concreteProdScheme;
            if (res.data) {
              this.data = res.data;
              if (res.data.length) {
                res.data.forEach(item => {
                  if (item.concreteProdScheme === 0) {
                    this.settingTime = item.concreteAge;
                  } else if (item.concreteProdScheme === 1) {
                    this.subTime = item.concreteAge;
                  }
                  // else if(item.concreteProdScheme === 2){
                  //   this.dosage=item.concreteAge
                  // }
                });
              } else {
                this.settingTime = "";
                this.subTime = "";
              }
            } else {
              this.settingTime = "";
              this.subTime = "";
            }
          }
        })
        .catch(err => {});
    }
  },
  watch: {
    basicDialog(val) {
      if (val) {
        this.queryBasics();
      } else {
        this.schemeRadio = 0;
        this.ageRadio = 0;
        this.settingTime = "";
        this.subTime = "";
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.dialog-item {
  display: flex;
  // justify-content: center;
  margin-bottom: 20px;
  .left {
    position: relative;
    width: 180px;
    font-size: 13px;
    padding-left: 40px;
    &::after {
      content: "";
      position: absolute;
      left: 30px;
      top: 0;
      width: 5px;
      height: 16px;
      border: 1px solid #000;
      background-color: #00ffff;
    }
  }
  .left2 {
    position: relative;
    width: 180px;
    font-size: 13px;
    padding-top: 5px;
    padding-left: 40px;
    &::after {
      content: "";
      position: absolute;
      left: 30px;
      top: 5px;
      width: 5px;
      height: 16px;
      border: 1px solid #000;
      background-color: #00ffff;
    }
  }
  .right {
    flex: 1;
    .el-radio-group {
      display: flex;
      flex-wrap: wrap;
      .el-radio {
        margin: 10px;
        margin-right: 40px;
      }
    }
  }
  .r1 {
    .el-radio-group {
      .el-radio {
        // width: 40%;
      }
    }
  }
  .r2 {
    .el-radio-group {
      .el-radio {
        width: 30%;
      }
    }
  }
}
.day {
  margin-left: 10px;
}
</style>
