<template>
  <div>
    <span class="demonstration">每页显示</span>
    <el-pagination
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    :current-page.sync="currentPage2"
    :page-sizes="[10, 20, 50, 100]"
    :page-size="100"
    layout="sizes, prev, pager, next"
    :total="1000"
  >
  </el-pagination>
</div>
</template> 



<script>
export default {
  data() {
    return {
      currentPage2: 1
    };
  },
  methods: {
    handleSizeChange(val) {
      console.log(val);
    },
    handleCurrentChange(val) {
      console.log(val);
    }
  }
};
</script>

<style lang="scss" scoped>
.el-pagination {
  text-align: center;
}
</style>
