<template>
  <div class="searchBar">
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
  height: 60px;
  padding: 0 20px;
  border: 1px solid #ebeef5;
  .searchBar-left,
  .searchBar-right {
    display: flex;
    align-items: center;
  }
  .el-form {
    margin-top: 20px;
    display: flex;
    align-items: center;
  }
}
</style>
