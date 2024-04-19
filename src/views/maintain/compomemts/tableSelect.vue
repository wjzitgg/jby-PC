<template>
  <div :id="createdId" class="tableSelect" ref="tableSelect">
    <div class="input-select el-input__inner" v-if="showSelect">
      <div class="tags">
        <el-tag v-for="(item, index) in multipleSelectionTags" :key="index" closable @close="handleCloseTag(item)" size="small" type="info" effect="plain">{{ item[keywordKey] || "" }}</el-tag>
        <input type="text" ref="selectInput" :value="value" :placeholder="placeholderForTag" @focus="onfocus" :disabled="disabled" @input="changeValue($event.target.value)" />
        <i class="el-icon-arrow-down select-down" :class="visible && 'rotate180'"></i>
      </div>
    </div>
    <!-- @input="changeValue" -->
    <el-input v-model="iphoneVal" maxlength="11" @focus="onfocus" @blur="onblur" @input="changeValue($event)" :disabled="disabled" :placeholder="placeholder" ref="inputValue" size="mini" v-if="showSelect == false && value == ''"></el-input>
    <el-input :value="showName" @focus="onfocus" @blur="onblur" @input="changeValue($event)" readonly :disabled="disabled" :placeholder="placeholder" size="mini" v-if="value"><i slot="suffix" class="el-input__icon el-icon-circle-close" @click="clear"></i></el-input>
    <div class="el-picker-panel" :style="pStyle" v-show="visible" ref="elcombogrid" style="width:100%">
      <div class="table-container">
        <!--  v-loading="listLoading" -->
        <el-table :data="list" @row-click="rowClick" stripe size="mini" height="100%" element-loading-text="Loading" ref="comboGridTable" fit border highlight-current-row @selection-change="handleSelectionChange" @select="handleSingelSelectionChange">
          <el-table-column type="selection" v-if="showSelect" width="55" align="center" />
          <el-table-column v-if="showIndex" label="序号" type="index" align="center" width="50"></el-table-column>
          <el-table-column v-for="item in columns" :type="item.type" :key="item.key" :label="item.label" :prop="item.key" :align="item.align" :width="item.width" :header-align="item.headerAlign">
            <template slot-scope="scope">
              <span>{{ scope.row[item.key] }}</span>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-show="pagination" small :total="total" :page-size="5" layout="prev, pager, next, total" @current-change="changePage" />
      </div>
    </div>
  </div>
</template>
<script>
import { Input } from "element-ui";
// import request from '@/utils/request';

export default {
  name: "el-combo-grid",
  props: {
    placeholder: { type: String },
    value: { type: String },
    requestConfig: {
      default: () => {
        return {
          url: "",
          method: "get"
        };
      }
    },
    columns: { type: Array },
    panelStyle: { type: String },
    keywordKey: { type: String }, //请求的keyword
    showIndex: { type: Boolean },
    pagination: { type: Boolean, default: false }, //是否分页
    otherParams: { default: () => {} },
    showSelect: { default: false }, // 是否多选
    getData: { type: Array },
    disabled: { type: Boolean, default: false },
    rowKey: { type: String, default: "id" }, //主键
    labelKey: { type: String, default: "name" } //显示的名称
  },
  computed: {
    // showName() {
    //   let arr = this.list.filter(item => item[this.rowKey] == this.value);
    //   return arr.length ? arr[0][this.labelKey] : this.value;
    // }
  },
  watch: {
    iphoneVal(val) {
      if (val == "") {
        this.list = this.getData;
      }
    }
  },
  data() {
    return {
      visible: false,
      pStyle: "width:500px",
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        pageNum: 1,
        pageSize: 5
      },
      keyword: "",
      createdId: "0",
      multipleSelection: [],
      multipleSelectionTags: [],
      placeholderForTag: "",
      iphoneVal: ""
    };
  },
  mounted() {
    this.createdId = String(new Date().getTime()); // 给个随机id 判断是否clickoutside
    this.placeholderForTag = this.placeholder;
    if (this.getData) {
      this.list = this.getData;
    }
  },
  methods: {
    changePage(cur) {
      this.listQuery.pageNum = cur;
      this.getList();
    },
    changeValue(value) {
      this.visible = true;
      let val = value;
      val = val.slice(0, 11);
      val = val.replace(/\D|^'0'/g, "");
      this.iphoneVal = val;
      if (this.iphoneVal.length == 11) {
        this.getConstructionUnitList(this.iphoneVal);
      }
    },
    clear() {
      // this.value = "";
      this.iphoneVal = "";
      this.$emit("clearVal", "");
    },
    getConstructionUnitList(telephone) {
      this.$api.getConstructionUnitList({ telephone }).then(res => {
        if (res.code == 200) {
          this.list = res.data;
        } else {
          this.$message({
            type: "error",
            message: res.msg
          });
        }
      });
    },
    onfocus(el) {
      this.pStyle = this.panelStyle + ";position:absolute;z-index:999999;";
      this.visible = true;
      this.keyword = el.target.value;
      document.removeEventListener("click", this.clickOutFn);
      document.addEventListener("click", this.clickOutFn);
      //   this.getList()
    },
    onblur(el) {
      // this.visible = false
    },
    getList() {
      for (let key in this.otherParams) {
        this.listQuery[key] = this.otherParams[key];
      }
      if (this.pagination) {
        this.listQuery[this.keywordKey] = this.keyword;
      } else {
        if (this.keyword) {
          this.listQuery[this.keywordKey] = this.keyword;
        } else {
          this.listLoading = false;
          return; //如果不分页，无keyword不查询数据（避免大数据量）
        }
      }
      this.listLoading = true;
      this.multipleSelection.length = 0;
      this.queryTableData(this.listQuery).then(response => {
        this.list = response.data.rows;
        this.total = response.data.total;
        this.listLoading = false;
        this.$nextTick(() => {
          // multipleSelectionTags 引用问题,无法与table数据全等。。。
          let ids = this.multipleSelectionTags.map(item => item.id);
          this.list.length &&
            this.list.forEach((item, index) => {
              if (ids.includes(item.id)) {
                this.$refs.comboGridTable.toggleRowSelection(item);
              }
            });
        });
      });
    },
    queryTableData(params) {
      const reqObj = {
        url: this.requestConfig.url,
        method: this.requestConfig.method
      };
      let p = this.requestConfig.method === "get" ? "params" : "data";
      reqObj[p] = params;
      return request(reqObj);
    },
    rowClick: function(row, column, event) {
      if (this.showSelect) {
        this.$refs.comboGridTable.toggleRowSelection(row);
        this.$emit("input", "");
      } else {
        this.visible = false;
        this.$emit("row-select-event", row, column, event);
        this.$emit("input", row[this.keywordKey]);
        document.removeEventListener("click", this.clickOutFn);
      }
      this.showName = row.orgName;
      console.log(row);
    },
    clickOutFn(e) {
      if (e.composedPath && e.composedPath().some(item => item.id === this.createdId)) return;
      this.visible = false;
      document.removeEventListener("click", this.clickOutFn);
    },
    /**
     * 根据选择与上次的选择进行对比，处理tags
     * todo 聚焦状态。。。触发太多，暂不处理
     */
    handleSelectionChange(val) {
      if (this.multipleSelection.length === 0 && val.length === 0) return;
      if (val.length > this.multipleSelection.length) {
        for (let item of val) {
          if (!this.multipleSelection.some(mitem => mitem.id === item.id)) {
            let ids = this.multipleSelectionTags.map(item => item.id);
            !ids.includes(item.id) && (this.multipleSelectionTags = this.multipleSelectionTags.concat(item));
          }
        }
      } else {
        for (let item of this.multipleSelection) {
          if (!val.some(mitem => mitem.id === item.id)) {
            let index = this.multipleSelectionTags.findIndex(mitem => mitem.id === item.id);
            index > -1 && this.multipleSelectionTags.splice(index, 1);
          }
        }
      }
      this.multipleSelection = val;
      this.placeholderForTag = this.multipleSelectionTags.length ? "" : this.placeholder;
      this.$emit("getSelect", this.multipleSelectionTags);
      // this.$refs.selectInput.focus() todo..
    },
    /**
     * 处理单个复选框选择
     */
    handleSingelSelectionChange() {
      this.$emit("input", "");
    },
    handleCloseTag(item) {
      this.multipleSelectionTags.splice(
        this.multipleSelectionTags.findIndex(mitem => mitem.id === item.id),
        1
      );
      this.$refs.comboGridTable.toggleRowSelection(item);
    }
  }
};
</script>

<style lang="scss" scoped>
.table-container {
  height: 200px;
}
.input-select {
  display: inline-block;
  position: relative;
  width: 100%;
  height: auto;
  min-width: 240px;
  -webkit-appearance: none;
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  color: #606266;
  font-size: inherit;
  outline: none;
  padding: 0 15px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  .select-down {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    transition: all 0.5s;
    &.rotate180 {
      transform: translateY(-50%) rotate(180deg);
    }
  }
  .tags {
    min-height: 36px;
    flex-wrap: wrap;
    line-height: normal;
    white-space: normal;
    z-index: 1;

    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    /deep/ .el-tag {
      margin-right: 3px;
      margin-bottom: 1px;
    }
    input {
      flex: 1;
      border: none;
      outline: none;
      padding: 0;
      color: #666;
      font-size: 14px;
      appearance: none;
      height: 28px;
      background-color: transparent;
      &::-webkit-input-placeholder {
        color: #c0c4cc;
      }
      &::-moz-placeholder {
        /* Mozilla Firefox 19+ */
        color: #c0c4cc;
      }
      &:-moz-placeholder {
        /* Mozilla Firefox 4 to 18 */
        color: #c0c4cc;
      }
      &:-ms-input-placeholder {
        /* Internet Explorer 10-11 */
        color: #c0c4cc;
      }
    }
  }
}
</style>
