<template>
  <div class="app-wrapper" v-loading="loading">
    <!-- <el-container>
      侧边栏
      <el-scrollbar class="aside_scroll" style="height:100%;">
        <sidebar class="sidebar-container"></sidebar>
      </el-scrollbar>

      <div class="content-body">
        头部栏
        <nav-bar></nav-bar>
        <tags></tags>
        主体展示部分
        <div class="main-container">
          <app-main></app-main>
        </div>

        底部
        <el-footer height="30px">建网工程管理系统V1.0</el-footer>
      </div>
    </el-container> -->
    <el-container>
      <el-header style="padding:0">
        <nav-bar @loadShow="loadShow"></nav-bar>
      </el-header>
      <el-container class="el-container-box">
        <el-aside width="250px">
          <sidebar style="width:100%" class="sidebar-container"></sidebar>
        </el-aside>
        <el-main style="background-color:  #f0f6fb;position: relative;padding-top: 50px;overflow: hidden;">
          <tags style="    position: absolute;width: 100%;top: 0;left: 0;"></tags>
          <app-main></app-main>
          <!-- style="background-color: #f2f8fd;" -->
          <!-- #f0f6fb -->
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>
import AppMain from "@/views/layout/components/AppMain"; // 页面布局的右侧区域
import sidebar from "@/views/layout/components/sidebar"; // 页面布局的左侧菜单
import navBar from "@/views/layout/components/sidebar/navBar"; // 页面布局的左侧菜单
import tags from "@/views/layout/components/sidebar/tags"; // 页面布局的左侧菜单

export default {
  name: "layout",
  components: {
    sidebar,
    AppMain,
    navBar,
    tags
  },
  data() {
    return {
      loading: false
    };
  },
  methods: {
    loadShow() {
      this.loading = !this.loading;
      console.log("退出系统");
    }
  }
};
</script>

<style scoped lang="scss">
.app-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
}
.sidebar-container {
  // background-image: url(../../../assets/index_img_city.png);
  background-image: url(../../assets/index_img_city.png);
  // transform: rotate(180deg);
  background-position: bottom left;
  // background-position: 0px 0px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.aside_scroll {
  width: 180px;
}

.el-footer {
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: #e3d9d9;
  letter-spacing: 1px;
  position: fixed;
  bottom: 0;
  left: 90px;
}

.content-body {
  width: 1740px;
  overflow-x: auto;
  overflow-y: hidden;
}

/deep/ .el-scrollbar__wrap {
  overflow-x: hidden;
  // overflow-y: hidden;
  background-color: #304156;
}

/deep/ .el-select-dropdown__wrap {
  overflow-x: scroll;
  // overflow-y: scroll;
  background-color: #fff;
}

/deep/ .el-menu {
  border-right: none;
}
.el-container-box {
  margin-top: 14px;
}
</style>
