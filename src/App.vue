<template>
  <div id="app">
    <!-- <img src="./assets/logo.png"> -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  mounted() {
    // 防止地图拖动选中问题，ctrl+a 选中的问题
    //  document.body.onselectstart = document.body.ondrag = function(){
    //   return false;
    // }
  }
};
</script>

<style>
body {
  margin: 0px;
  overflow: hidden;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body,
html {
  width: 100%;
  height: 100%;
}
#app {
  height: 100%;
}
.el-container {
  height: 100%;
}
.el-menu {
  border-right: none;
  height: 100%;
}

.el-dialog__body {
  padding: 0 20px 10px !important;
}
.is-dark {
  z-index: 999999 !important;
}
</style>
