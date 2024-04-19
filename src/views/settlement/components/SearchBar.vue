<template>
  <div class="searchBar search-bar-box">
    <div class="searchBar-left">
      <slot name="left"></slot>
    </div>
    <div class="searchBar-right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
export default {};
</script>
<style lang="scss" scoped>
.searchBar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background-color: $searcHeder;
  padding: 4px 0;
  margin-bottom: 14px;
  .searchBar-left,
  .searchBar-right {
    display: flex;
    align-items: center;
  }
  .el-form {
    display: flex;
    align-items: center;
    /deep/ .el-form-item {
      margin-bottom: 0;
    }
  }
}
</style>
