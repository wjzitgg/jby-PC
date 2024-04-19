<template>
  <div class="control-bar-comp" :class="'align-'+position">
    <el-button 
      :id="item.permission"
      size="small" 
      v-has="item.permission"
      v-for="(item, index) in options" 
      :key="index" :icon="`el-icon-${item.icon}`"
      @click="select(item)"
      :type="item.type"
      :disabled="item.disabled"
    >
      {{item.name}}
    </el-button>
    <el-select v-if="options[options.length-1].type=='more'" v-model="selectValue" class="more" placeholder="更多操作">
      <el-option
        v-for="item in options[options.length-1].options"
        :key="item.value"
        @click.native="select(item.label)"
        :label="item.label"
        :value="item.value">
      </el-option>
    </el-select>
  </div>
</template>

<script>
  export default {
    name: 'controlBar',
    props: {
      // 位置
      position: {
        default: 'left'
      },
      // 配置参数
      options: {
        default() {
          return [
            // {
            //   type: 'delete', // 按钮类型
            //   name: '按钮名称', // 按钮名称
            //   change() { // 点击执行
            //   }
            // }
          ]
        }
      },
    },
    data() {
      return {
        selectValue: ''
      };
    },
    methods: {
      select(val) {
        this.selectValue = val;
        this.$emit('select', val)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .control-bar-comp{
    margin: 10px 0;
    .el-button{
      margin: 0 8px 0 0;
    }
    &.align-right{
      text-align: right;
    }
    &.align-center{
      text-align: center;
    }
    &.align-left{
      text-align: left;
    }
  }
</style>
