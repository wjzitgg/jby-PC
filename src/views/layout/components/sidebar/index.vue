<template>
    <el-menu mode="vertical" unique-opened :default-active="$route.path" background-color="#fff" text-color=" rgba(119, 119, 119, 1)" active-text-color="#409EFF">
      <sidebar-item :routes="routes"></sidebar-item>
    </el-menu>
</template>

<script>
import sidebarItem from './sidebarItem'

export default {
  components: { sidebarItem },
  computed: {
    routes() {
      // console.log(global.antRouter);
      return global.antRouter
     
      // return this.$router.options.routes;
    }
   
  }
}
</script>
