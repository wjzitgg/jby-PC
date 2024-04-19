<template>
  <div class="searchBar">
    <div class="searchBar-left">
      <slot name="left">左侧</slot>
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
  height: 80px;
  background-color: #fff;
  padding: 4px 0;
  margin-bottom: 10px;
  border-radius: 5px;
  .searchBar-left,
  .searchBar-right {
    display: flex;
    align-items: center;
    margin-right: 20px;
  }
  .el-form {
    display: flex;
    align-items: center;
  }
}
</style>
