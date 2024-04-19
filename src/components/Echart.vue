<template>
  <div class="my-charts" :ref="echartName" :style="mystyle"></div>
</template>

<script>
export default {
  props: {
    option: {
      type: Object,
    },
    // echartName,赋予一个默认值，那么我们不传echartName也是可以的
    echartName: {
      type: String,
      default: "chartDom",
    },
    mystyle: {
      default: "",
    },
  },
  data() {
    return {};
  },
  mounted() {
    this.draw();
  },
  methods: {
    draw() {
      // 基于准备好的dom，初始化echarts实例
      let echartName = this.echartName;
      let myChart = this.$echarts.init(this.$refs[echartName]);
      // 绘制图表
      if (this.option) {
        myChart.setOption(this.option);
      }
    },
  },
  watch: {
    option: {
      handler(val) {
        setTimeout(() => {
          this.draw();
        }, 200);
      },
      deep: true,
    },
  },
};
</script>

<style lang="scss" scoped>
</style>