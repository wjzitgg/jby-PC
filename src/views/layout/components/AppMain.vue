<template>
  <section class="app-main">
    <transition name="fade" mode="out-in">
      <router-view></router-view>
      <!-- <tabBar/> -->
    </transition>
  </section>
</template>

<script>
import TabBar from "./sidebar/tabBar.vue";
export default {
  name: "AppMain",
  components: {
    TabBar
  },
  computed: {
    // key() {
    //   return this.$route.name !== undefined ? this.$route.name + +new Date() : this.$route + +new Date()
    // }
  }
};
</script>
