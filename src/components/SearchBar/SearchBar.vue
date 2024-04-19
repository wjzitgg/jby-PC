<template>
  <div class="search-bar-comp">
    <el-collapse-transition>
      <div v-show="show">
        <el-form :inline="true" :model="form" :label-width="labelWidth" class="search-mr">
          <span v-for="(formItem, itemIndex) in _options" :key="itemIndex" class="form-item-line">
            <el-form-item :label="formItem.title" v-if="formItem.type === 'input'" v-show="formItem.show == false ? formItem.show : true" :class="{ 'is-required': formItem.required ? true : false }">
              <el-input
                size="mini"
                :id="formItem.id"
                v-model.trim="form[formItem.prop]"
                :placeholder="`${formItem.placeholder}`"
                :disabled="disabled || formItem.disabled || false"
                :maxlength="formItem.maxlength"
                @change="
                  val => {
                    typeof formItem.change === 'function' && formItem.change(val);
                  }
                "
              ></el-input>
              <!-- <el-button class="device-btn" v-if="formItem.bindDevice" size="mini" @click="deviceHandler(formItem)" :disabled="formItem.bindDevice.disabled || false">{{ formItem.bindDevice.label || "设备读取" }}</el-button> -->
            </el-form-item>
            <el-form-item :label="formItem.title" v-if="formItem.type === 'inputPhone'" v-show="formItem.show == false ? formItem.show : true" :class="{ 'is-required': formItem.required ? true : false }">
              <el-input
                size="mini"
                :id="formItem.id"
                type="number"
                oninput="if(value.length>11)value=value.slice(0, 11)"
                v-model.trim="form[formItem.prop]"
                :placeholder="`${formItem.placeholder}`"
                :disabled="disabled || formItem.disabled || false"
                @change="
                  val => {
                    typeof formItem.change === 'function' && formItem.change(val);
                  }
                "
              ></el-input>
              <!-- <el-button class="device-btn" v-if="formItem.bindDevice" size="mini" @click="deviceHandler(formItem)" :disabled="formItem.bindDevice.disabled || false">{{ formItem.bindDevice.label || "设备读取" }}</el-button> -->
            </el-form-item>
            <el-form-item :label="formItem.title" v-if="formItem.type === 'proSel'" v-show="formItem.show == false ? formItem.show : true" :class="{ 'is-required': formItem.required ? true : false }">
              <treeSelect @selectIds="selectIds"></treeSelect>
              <!-- <el-button class="device-btn" v-if="formItem.bindDevice" size="mini" @click="deviceHandler(formItem)" :disabled="formItem.bindDevice.disabled || false">{{ formItem.bindDevice.label || "设备读取" }}</el-button> -->
            </el-form-item>
            <el-form-item :label="formItem.title" v-show="formItem.show == false ? formItem.show : true" v-if="formItem.type === 'select'" :class="{ 'is-required': formItem.required ? true : false }">
              <el-select
                filterable
                :clearable="formItem.clearable === false ? formItem.clearable : true"
                size="mini"
                :multiple="formItem.multiple || false"
                v-model="form[formItem.prop]"
                :placeholder="`请选择${formItem.title}`"
                :disabled="disabled || formItem.disabled || false"
                :remote-method="typeof formItem.remoteMethod === 'function' ? formItem.remoteMethod : null"
                @change="
                  val => {
                    typeof formItem.change === 'function' && formItem.change(val);
                  }
                "
              >
                <el-option :label="optionItem[(formItem.setProps && formItem.setProps.label) || 'label']" :value="optionItem[(formItem.setProps && formItem.setProps.key) || 'value']" v-for="(optionItem, optionIndex) in formItem.options" :key="optionIndex"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="formItem.title" v-if="formItem.type === 'minMax'" class="min-max">
              <el-input size="mini" v-model.trim="form[formItem.options[0]]" type="text" v-enterTxt placeholder="输入最小值" maxlength="10"></el-input>
              <span v-if="formItem.type == 'minMax'" class="siding-flag">—</span>
              <el-input size="mini" v-enterTxt v-model.trim="form[formItem.options[1]]" type="text" placeholder="输入最大值" maxlength="10"></el-input>
            </el-form-item>
            <el-form-item :label="formItem.title" v-if="formItem.type === 'datepicker'" v-show="formItem.show == false ? formItem.show : true" :class="{ 'is-required': formItem.required ? true : false }">
              <el-date-picker
                size="mini"
                v-model="form[formItem.prop]"
                type="date"
                :picker-options="formItem.pickerOptions || null"
                :placeholder="`请选择${formItem.title}`"
                :disabled="disabled || formItem.disabled || false"
                @change="
                  val => {
                    typeof formItem.change === 'function' && formItem.change(val);
                  }
                "
              ></el-date-picker>
            </el-form-item>
            <el-form-item :label="formItem.title" :class="{ 'is-required': formItem.required ? true : false }" v-if="formItem.type === 'datepicker-range'">
              <el-date-picker
                size="mini"
                v-model="form[formItem.prop]"
                type="daterange"
                :picker-options="formItem.pickerOptions || null"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :disabled="disabled || formItem.disabled || false"
                @change="
                  val => {
                    typeof formItem.change === 'function' && formItem.change(val);
                  }
                "
              ></el-date-picker>
            </el-form-item>
            <el-form-item :label="formItem.title" v-if="formItem.type === 'datetime'">
              <el-date-picker
                size="mini"
                v-model="form[formItem.prop]"
                type="datetime"
                :picker-options="formItem.pickerOptions || null"
                :placeholder="`请选择${formItem.title}`"
                :disabled="disabled || formItem.disabled || false"
                @change="
                  val => {
                    typeof formItem.change === 'function' && formItem.change(val);
                  }
                "
              ></el-date-picker>
            </el-form-item>
            <el-form-item :label="formItem.title" class="datetime-end" v-if="formItem.type === 'datetime-end'">
              <el-date-picker
                size="mini"
                v-model="form[formItem.prop]"
                type="date"
                :picker-options="formItem.pickerOptions || null"
                :placeholder="`请选择${formItem.title}`"
                :disabled="disabled || formItem.disabled || false"
                @change="
                  val => {
                    typeof formItem.change === 'function' && formItem.change(val);
                  }
                "
              ></el-date-picker>
            </el-form-item>
            <el-form-item :label="formItem.title" v-if="formItem.type === 'datetime-range'">
              <el-date-picker
                size="mini"
                v-model="form[formItem.prop]"
                type="datetimerange"
                :picker-options="formItem.pickerOptions || null"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                :disabled="disabled || formItem.disabled || false"
                @change="
                  val => {
                    typeof formItem.change === 'function' && formItem.change(val);
                  }
                "
              ></el-date-picker>
            </el-form-item>
            <el-form-item :label="formItem.title" v-if="formItem.type === 'year'">
              <el-date-picker
                size="mini"
                v-model="form[formItem.prop]"
                type="year"
                :picker-options="formItem.pickerOptions || null"
                :placeholder="`请选择${formItem.title}`"
                :disabled="disabled || formItem.disabled || false"
                @change="
                  val => {
                    typeof formItem.change === 'function' && formItem.change(val);
                  }
                "
              ></el-date-picker>
            </el-form-item>
            <el-form-item :label="formItem.title" v-if="formItem.type === 'month'">
              <el-date-picker
                size="mini"
                v-model="form[formItem.prop]"
                type="month"
                :picker-options="formItem.pickerOptions || null"
                :placeholder="`请选择${formItem.title}`"
                :disabled="disabled || formItem.disabled || false"
                @change="
                  val => {
                    typeof formItem.change === 'function' && formItem.change(val);
                  }
                "
              ></el-date-picker>
            </el-form-item>
            <el-form-item :label="formItem.title" v-if="formItem.type === 'cascader'" :class="{ 'is-required': formItem.required ? true : false }">
              <el-cascader
                size="mini"
                v-model="form[formItem.prop]"
                :value="formItem.value"
                :props="formItem.setProps"
                :options="formItem.options"
                :placeholder="`请选择${formItem.title}`"
                :disabled="disabled || formItem.disabled || false"
                popper-class="cascader-selector"
                @change="
                  val => {
                    typeof formItem.change === 'function' && formItem.change(val);
                  }
                "
              ></el-cascader>
            </el-form-item>
            <el-form-item :label="formItem.title" v-if="formItem.type == 'input-scan'" :class="{ 'is-required': formItem.required ? true : false }">
              <div class="no-ime el-input--small">
                <input v-model="form[formItem.prop]" type="text" :placeholder="placeholder" class="el-input__inner no-ime__input" :class="{ border: isFocus }" />
                <input v-model="form[formItem.prop]" @focus="focus" @blur="blur" type="password" class="el-input__inner no-ime__proxy" />
              </div>
            </el-form-item>
          </span>
          <el-form-item class="btn-wrap" v-if="showSearchBtn">
            <el-button size="mini" type="primary" @click="onSubmit" class="el-button-primary" icon="el-icon-search" :disabled="disabled || false">查 询</el-button>
            <!-- <el-button size="mini" @click="reset" :disabled="disabled || false">重置</el-button> -->
            <slot name="extend-btns"></slot>
            <el-button size="mini" type="text" @click="onDrop" v-if="options.length > 8" :disabled="disabled || false">
              {{ collapse ? "展开" : "收起" }}
              <i :class="[collapse ? 'el-icon-arrow-down' : 'el-icon-arrow-up']"></i>
            </el-button>
          </el-form-item>
        </el-form>
        <!--拓展插槽-->
        <slot name="extend-bar"></slot>
        <!-- <p class="tips-item" v-if="isResult&&showSearch" :class="{'mr80': showHandler}">
          <i class="el-alert__icon el-icon-info"></i>
          <span>
            共搜索到
            <em>{{total}}</em>条数据
          </span>
        </p> -->
      </div>
    </el-collapse-transition>
  </div>
</template>

<script>
import treeSelect from "../proTreeSelect/treeSelect.vue";
const trigger = (el, type) => {
  const e = document.createEvent("HTMLEvents");
  e.initEvent(type, true, true);
  el.dispatchEvent(e);
};

export default {
  components: { treeSelect },
  name: "searchBar",
  props: {
    disabled: {
      default: false
    },
    showHandler: {
      default: false
    },
    showSearch: {
      default: true
    },
    showSearchBtn: {
      default: true
    },
    // 配置参数
    options: {
      default() {
        return [];
      }
    },
    // 标签宽度
    labelWidth: {
      default: "70px"
    },
    // 搜索结果条数
    total: {
      default: 0
    }
  },
  data() {
    return {
      show: true,
      form: {},
      _options: [],
      collapse: true,
      showValidation: false,
      isResult: false,
      isFocus: false,
      placeholder: ""
    };
  },
  watch: {
    options: {
      handler(newVal) {
        if (this.$route.name == "培训") {
          this._options = newVal; // 处理培训bug 新增
        }
        if (this.$route.name == "customerAccountList") {
          this._options = newVal.slice(0, 2);
        }
        if (this.$route.name == "myToDo" || this.$route.name == "myToDos") {
          newVal.forEach((item, index) => {
            if (item.prop == "date" && item.value.length) {
              this.$set(this.form, "date", newVal[index].value);
            }
          });
        }
      },
      deep: true
    },
    form: {
      handler(newVal, oldVal) {
        this.$emit("change", newVal, oldVal);
      },
      deep: true
    }
    // "form.fkProjectId":{
    //   handler(newVal, oldVal) {
    //     this.$emit("fkProjectIdChange", newVal, oldVal);
    //   },
    //   deep: true
    // }
  },
  created() {
    this._options = this.options;
    this.options.forEach(item => {
      this.$set(this.form, item.prop, item.value);
    });
  },

  destroyed() {
    this.closeWS();
  },
  methods: {
    selectIds(arr, obj, isTrue) {
      if (arr.length) {
        if (arr.length > 1) {
          this.$set(this.form, "fkProjectId", arr[0]);
          this.$set(this.form, "fkProjectBidId", arr[1]);
        } else {
          this.$set(this.form, "fkProjectBidId", arr[0]);
        }
        if (isTrue) {
          const formData = {};
          for (const key in this.form) {
            if (this.form[key] !== "") {
              formData[key] = this.form[key];
            }
          }
          this.$emit("search", formData);
        }
      }
      console.log("获取到的", arr, obj);
    },
    onSubmit() {
      // 验证
      const self = this;
      const required = [];
      self.options.forEach(item => {
        if (item.required) {
          required.push(item.prop);
        }
      });
      if (
        self.options.some(option => {
          if (
            Array.isArray(option.rules) &&
            option.rules.some(rule => {
              if (!new RegExp(rule.pattern).test(self.form[option.prop]) && rule.loose && self.form[option.prop]) {
                self.$message.warning(rule.message || `${option.title}输入有误`);
                return true;
              }

              if (rule.loose === false && !self.form[option.prop]) {
                self.$message.warning(`${option.title}不能为空`);
                return true;
              }
            })
          ) {
            return true;
          }
        })
      ) {
        return false;
      }

      const formData = {};
      for (const key in this.form) {
        if (this.form[key] !== "") {
          formData[key] = this.form[key];
        }
      }

      let title = "";
      const isCheck = this._options.some(item => {
        title = item.title;
        // if (!item.unCheck) {
        //   return this.$rules.special(formData[item.prop])
        // }
        return false;
      });
      if (isCheck) {
        this.$message.warning(`${title}不能包含特殊字符`);
        return;
      }

      if (this.$route.name == "channelList") {
        if (formData.phone) {
          const phone = String(formData.phone).trim();
          const test = /^[0-9]*$/.test(phone);
          if (!test) {
            this.$message.warning("联系电话必须为数字");
            return;
          }
        }
      }
      this.isResult = true;
      required.forEach(item => {
        if (!formData[item]) {
          this.isResult = false;
        }
      });
      // if(this.$route.name == 'lotteryTicket'){
      //   if(!(formData.cashStatus&&formData.timeWin&&formData.timeWin.length>0)){
      //     this.isResult = false;
      //   }
      // }
      // if(Object.keys(formData).length>0){
      //   this.isResult = true;
      // }

      this.$emit("search", formData);
    },
    onDrop() {
      this.collapse = !this.collapse;
      if (!this.collapse) {
        this._options = this.options;
      } else {
        this._options = this.options.slice(0, 2);
      }
    },
    blur() {
      this.placeholder = "";
      this.isFocus = false;
    },
    focus() {
      this.placeholder = "请扫描兑奖码";
      this.isFocus = true;
    },
    reset() {
      for (const key in this.form) {
        this.form[key] = "";
      }
      console.log("2222222222222222222");
      // this.$emit("searchReset");
    },
    payReset() {
      for (const key in this.form) {
        this.form[key] = "";
        this.form.enableStatus = "-1";
        this.form.orgScale = "-1";
      }
      // this.$emit("searchReset");
    },

    closeWS() {
      this.options.forEach(item => {
        if (item.bindDevice) {
          if (item.socket) {
            // 关闭websocket
            item.socket.close();
          }
        }
      });
    },

    fkProfessionalTypeId() {
      if (this.form.fkProfessionalTypeId != "") {
        this.form.fkProfessionalTypeId = "";
      }
    },

    fkEnginerringTypeId() {
      if (this.form.fkProfessionalTypeId != "") {
        this.form.fkProfessionalTypeId = "";
      }
      if (this.form.fkEnginerringTypeId != "") {
        this.form.fkEnginerringTypeId = "";
      }
    },
    fkTeamIdChange() {
      if (this.form.fkTeamId != "") {
        this.form.fkTeamId = "";
      }
    },

    clean(propsName) {
      this.form[propsName] = "";
    },
    menuTypes() {
      this.form.menuType = "";
    },
    workflowType(val) {
      this.form.workflowType = val;
    },
    noProjects() {
      if (this.form.fkTeamId != "") {
        this.form.fkTeamId = "";
      }
    }
  },
  directives: {
    enterTxt: {
      inserted(el, binding) {
        const input = el.getElementsByTagName("input")[0];
        input.onkeyup = function(e) {
          if (input.value.length === 1) {
            input.value = input.value.replace(/[^A-Za-z0-9-_\u4e00-\u9fa5]/g, "");
          } else {
            input.value = input.value.replace(/[^A-Za-z0-9-_\u4e00-\u9fa5]/g, "");
          }
          trigger(input, "input");
        };
        input.onblur = function(e) {
          input.value = input.value.replace(/[^A-Za-z0-9-_\u4e00-\u9fa5]/g, "");

          trigger(input, "input");
        };
      }
    }
  }
};
</script>

<style lang="scss">
.search-bar-comp {
  // padding: 15px 0 10px;
  // .handler {
  //   // padding-top: 5px;
  //   text-align: right;
  //   font-size: 12px;
  //   margin-top: -33px;
  //   color: #999;
  //   margin-bottom: 10px;
  //   &.onTop {
  //     padding-top: 0;
  //     margin-top: -15px;
  //     margin-bottom: 0;
  //   }
  //   .el-button {
  //     margin-right: 0;
  //     // padding: 5px 7px;
  //     height: 18px;
  //     color: #409eff;
  //     background: transparent;
  //     border-color: transparent;
  //     span {
  //       margin-left: 0;
  //     }
  //   }
  // }
  .el-form {
    // padding-top: 18px;
    // padding-bottom: 8px;
    // line-height: 80px;
    height: 80px;
    margin: 0;
    border-radius: 5px;
    background-color: #fff;
    color: #333333;
    .el-button--text:hover {
      background-color: transparent;
      color: #57a3f3;
      border-color: transparent;
    }
    .el-button--text:focus {
      background-color: transparent;
      color: #57a3f3;
      border-color: transparent;
    }
  }
  .btn-wrap {
    margin-top: 23px;
    padding-left: 30px;
    // margin-bottom: 10px;
  }
  .el-button {
    margin: 0 8px 0 0;
  }
  .tips-item {
    height: 34px;
    line-height: 34px;
    background-color: #f0faff;
    border: 1px solid #abdcff;
    font-size: 12px;
    color: #515a6e;
    border-radius: 4px;
    padding: 0 10px;
    margin: 10px 0 0;
    display: flex;
    align-items: center;
    &.mr80 {
      margin-right: 80px;
    }
    em {
      color: #2d8cf0;
      font-style: normal;
      padding: 0 3px;
    }
    i {
      vertical-align: middle;
      color: #2d8cf0;
      margin-right: 5px;
    }
  }
  .form-item-line {
    display: inline-block;
    vertical-align: top;
    margin-top: 24px;
    .el-form-item {
      // margin-bottom: 10px;
      position: relative;
      .device-btn {
        position: absolute;
        right: 1px;
        top: 2px;
        bottom: 11px;
        border: none;
        box-sizing: border-box;
        margin-right: 0;
        border-left: 1px solid #dcdfe6;
        border-radius: 0 5px 5px 0;
        padding: 0 7px;
        height: 30px;
        line-height: 30px;
        font-size: 12px;
        min-width: 4em;
      }
    }
    * {
      font-size: 12px;
    }
  }
  .el-input__inner {
    width: 140px;
  }
  .el-input {
    width: auto;
  }
  .el-form-item__label,
  .el-form-item__content {
    line-height: 32px;
  }
  .min-max {
    .siding-flag {
      margin: 0 5px;
    }
    input {
      width: 108px;
    }
    .el-input {
      width: 108px;
    }
  }
}
.no-ime {
  position: relative;
  display: inline-block;
  input {
    // normalize font width
    font-size: 14px;
    font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, SimSun, sans-serif;
  }
  &__input {
    ime-mode: disabled;
    border: 1px solid #dcdfe6;
  }
  &__proxy {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    color: transparent;
    background: transparent;
    border: none;
    outline: none;
    // caret-color: red;
  }
}
.border {
  border-color: #409eff;
}
.cascader-selector {
  /deep/ .el-cascader-node.in-active-path {
    color: #606266;
    font-weight: 400;
  }
}
</style>
