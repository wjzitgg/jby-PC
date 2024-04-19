<template>
  <div class="menu-wrapper">
    <!-- <div class="logo">
      <img src="@/assets/logo.png" alt="">
    </div> -->
    <template v-for="item in routes">
      <template v-if="!item.hidden && item.children">
        <router-link v-if="item.children[0].path == 'home'" :to="item.path + '/' + item.children[0].path" :key="item.children[0].name">
          <el-menu-item @click="pitchOn = '首页'" :index="item.path + '/' + item.children[0].path" :class="{ 'submenu-title-noDropdown': !isNest }">
            <!-- <i :class="`iconfont icon${item.meta.icon}`"></i> -->
            <!-- <img    :src="item.meta.menuIcon" alt=""> -->
            <!-- selectedIcon -->
            <!-- <el-avatar shape="square" :size="100" v-if="item.children[0].meta && item.children[0].meta.menuIcon" :fit="fit" :src="item.children[0].meta.menuIcon"></el-avatar> -->
            <el-image v-show="pitchOn == '首页'" shape="square" v-if="homeData.meta.selectedIcon != undefined && homeData.meta.selectedIcon != null && homeData.meta.selectedIcon.length != 0" style="width: 18px; height: 18px" fit="scale-down" :src="homeData.meta.selectedIcon"></el-image>
            <el-image v-show="pitchOn != '首页'" shape="square" v-if="homeData.meta.menuIcon != undefined && homeData.meta.menuIcon != null && homeData.meta.menuIcon.length != 0" style="width: 18px; height: 18px" fit="scale-down" :src="homeData.meta.menuIcon"></el-image>
            <span class="home-name" v-if="item.children[0].meta && item.children[0].meta.title">{{ item.children[0].meta.title }}</span>
          </el-menu-item>
        </router-link>

        <!-- <el-submenu v-if="item.children[0].path == 'home'" :index="item.name || item.path" :key="item.name">
          <template slot="title">
            <el-image v-show="pitchOn == item.meta.title" shape="square" v-if="item.meta.selectedIcon != undefined && item.meta.selectedIcon != null && item.meta.selectedIcon.length != 0" style="width:18px;height: 18px;" fit="scale-down" :src="item.meta.selectedIcon"></el-image>
            <el-image v-show="pitchOn != item.meta.title" shape="square" v-if="item.meta.menuIcon != undefined && item.meta.menuIcon != null && item.meta.menuIcon.length != 0" style="width:18px;height: 18px;" fit="scale-down" :src="item.meta.menuIcon"></el-image>
            <span v-if="item.meta && item.meta.title">{{ item.meta.title }}</span>
          </template>

          <template v-for="child in item.children">
            <template v-if="!child.hidden">
              <sidebar-item :is-nest="true" class="nest-menu" v-if="child.children && child.children.length > 0" :routes="[child]" :key="child.path"></sidebar-item>

              <router-link v-else :to="item.path + '/' + child.path" :key="child.name">
                <el-menu-item :index="item.path + '/' + child.path" @click="pitchOnClick(item)">
                  <span v-if="child.meta && child.meta.title">{{ child.meta.title }}</span>
                </el-menu-item>
              </router-link>
            </template>
          </template>
        </el-submenu> -->
        <!-- <template v-if="item.meta.isGroup == true">
          <div></div>
        </template> -->
        <el-submenu v-else v-show="!item.meta.show" :index="item.name || item.path" :key="item.name">
          <template slot="title" v-if="item.meta.isGroup == true">
            <!-- <el-image v-show="pitchOn == item.meta.title" shape="square" v-if="item.meta.selectedIcon != undefined && item.meta.selectedIcon != null && item.meta.selectedIcon.length != 0" style="width: 18px; height: 18px" fit="scale-down" :src="item.meta.selectedIcon"></el-image>
            <el-image v-show="pitchOn != item.meta.title" shape="square" v-if="item.meta.menuIcon != undefined && item.meta.menuIcon != null && item.meta.menuIcon.length != 0" style="width: 18px; height: 18px" fit="scale-down" :src="item.meta.menuIcon"></el-image> -->
            <span v-if="item.meta && item.meta.title">{{ item.meta.title }}</span>
          </template>
          <template slot="title" v-if="item.meta.isGroup == false">
            <el-image v-show="pitchOn === item.name" shape="square" v-if="item.meta.selectedIcon != undefined && item.meta.selectedIcon != null && item.meta.selectedIcon.length != 0" style="width: 18px; height: 18px" fit="scale-down" :src="item.meta.selectedIcon"></el-image>
            <el-image v-show="pitchOn !== item.name" shape="square" v-if="item.meta.menuIcon != undefined && item.meta.menuIcon != null && item.meta.menuIcon.length != 0" style="width: 18px; height: 18px" fit="scale-down" :src="item.meta.menuIcon"></el-image>
            <span v-if="item.meta && item.meta.title">{{ item.meta.title }}</span>
          </template>
          <!-- ============== -->
          <template v-if="item.meta.isGroup == true">
            <template v-for="child in item.children">
              <template v-if="!child.hidden">
                <sidebar-item :is-nest="true" class="nest-menu" v-if="child.children && child.children.length > 0" :routes="[child]" :key="child.path"></sidebar-item>
                <router-link v-else @click="linkClick(child)" :key="child.name">
                  <el-menu-item :index="item.path + '/' + child.path" @click="pitchOnClick(item)">
                    <span v-if="child.meta && child.meta.title">{{ child.meta.title }}</span>
                  </el-menu-item>
                </router-link>
              </template>
            </template>
            <!-- xxxxxxxxxxxxxxx1111111111111111111111 -->

            <!-- <template v-for="items in item.children">
              <el-submenu :index="items.name || items.path" :key="items.name">
                <template slot="title">
                  <el-image v-show="pitchOn == items.meta.title" shape="square" v-if="item.meta.selectedIcon != undefined && items.meta.selectedIcon != null && items.meta.selectedIcon.length != 0" style="width: 18px; height: 18px" fit="scale-down" :src="item.meta.selectedIcon"></el-image>
                  <el-image v-show="pitchOn != items.meta.title" shape="square" v-if="item.meta.menuIcon != undefined && items.meta.menuIcon != null && items.meta.menuIcon.length != 0" style="width: 18px; height: 18px" fit="scale-down" :src="item.meta.menuIcon"></el-image>
                  <span v-if="items.meta && items.meta.title">{{ items.meta.title }}</span>
                </template>
                <template>
                  <template v-for="child in items.children">
                    <template v-if="!child.hidden">
                      <sidebar-item :is-nest="true" class="nest-menu" v-if="child.children && child.children.length > 0" :routes="[child]" :key="child.path"></sidebar-item>

                      <router-link v-else :to="items.path + '/' + child.path" :key="child.name">
                        <el-menu-item :index="items.path + '/' + child.path" @click="pitchOnClick(items)">
                          <span v-if="child.meta && child.meta.title">{{ child.meta.title }}</span>
                        </el-menu-item>
                      </router-link>
                    </template>
                  </template>
                </template>
              </el-submenu>
            </template> -->

            <!-- 11111111111111111111 -->
          </template>
          <!-- =============== -->
          <template v-else>
            <template v-for="child in item.children">
              <template v-if="!child.hidden">
                <sidebar-item :is-nest="true" class="nest-menu" v-if="child.children && child.children.length > 0" :routes="[child]" :key="child.path"></sidebar-item>

                <router-link v-else :to="item.path + '/' + child.path" :key="child.name">
                  <el-menu-item :index="item.path + '/' + child.path" @click="pitchOnClick(item)">
                    <span v-if="child.meta && child.meta.title">{{ child.meta.title }}</span>
                  </el-menu-item>
                </router-link>
              </template>
            </template>
          </template>
        </el-submenu>
      </template>
    </template>
  </div>
</template>

<script>
import template from "../../../sms/template.vue";
export default {
  components: { template },
  name: "sidebarItem",
  data() {
    return {
      pitchOn: "首页",
      homeData: {
        meta: {
          menuIcon: "",
          selectedIcon: ""
        }
      },
      activeNames: []
    };
  },
  props: {
    routes: {
      type: Array
    },
    isNest: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx===================xxxxxxxxxxxxxxxxxxx");
    console.log(this.routes);
    console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx===================xxxxxxxxxxxxxxxxxxx");
    const divElement = document.getElementById("app");
    const customTable = document.querySelectorAll(".menu-wrapper")[0];
    customTable.style.height = divElement.offsetHeight - 80 + "px ";
    this.homeData = JSON.parse(sessionStorage.getItem("home")) == undefined ? this.homeData : JSON.parse(sessionStorage.getItem("home"));
    const name = window.localStorage.getItem("pitchOn");
    if (name != undefined && name != null && name.length != 0) {
      this.pitchOn = name;
    }
  },
  methods: {
    linkClick(row) {
      console.log("Xxxxxxxxxxxxxxx");
      console.log(row);
      console.log("Xxxxxxxxxxxxxxx");
    },
    pitchOnClick(item) {
      // console.log(item)
      this.pitchOn = item.name;
      console.log("XxxxxxXXXXXXXXXXXXXXXXXXXX1111111111xxxxxxxxx");
      console.log(item);
      console.log(this.pitchOn)
      // console.log
      console.log("XxxxxxxxxxxAAAAAAAAA111111111111111111111xxxx");
      // window.localStorage.setItem("pitchOn", this.pitchOn);
    }
  }
};
</script>
<style lang="scss" scoped>
/deep/ .el-avatar {
  background: none;
}

.menu-wrapper {
  // padding-bottom: 90px;
  // max-height: 800px;
  overflow: auto;
  // .is-active {
  //   background-color: red;
  // }
  /deep/ .is-active {
    .el-submenu__title {
      // background-color: #d9e7f9 !important;

      .iconfont {
        // color: #3f8dfd;
      }
    }

    .el-menu .el-menu-item {
      background-color: #ebf1f9 !important;
    }

    .el-menu .is-active {
      background-color: #bcd6fa !important;
    }
  }
}
.nest-menu{
  overflow: hidden;
}
.el-submenu .el-menu-item {
  // padding-left: 62px !important;
}
/deep/ .el-submenu__title {
  background-color: transparent !important;
}
/deep/ .el-submenu__title span,
/deep/ .el-menu-item span,
.home-name {
  padding-left: 8px;
}
.iconfont {
  color: rgba(119, 119, 119, 1);
  font-size: 18px;
  margin-right: 20px;
  width: 100%;
}

::-webkit-scrollbar {
  width: 0px !important;
  color: #ccc;
  background-color: #fcfcfc;
}

::-webkit-scrollbar-thumb {
  width: 0px;
  background-color: rgb(209, 209, 209);
}

// router-link-exact-active router-link-active
//  .menu-wrapper a{
//     background-color:#d9e7f9 !important;
//   }
.menu-wrapper > a .is-active {
  // background-color: red !important;;
  background-color: #bcd6fa !important;
}

.menu-wrapper > a .submenu-title-noDropdown:hover {
  background-color: #bcd6fa !important;
}

// .logo {
//   padding: 10px;
//   height: 60px;
//   img {
//     display: block;
//     width: 160px;
//     height: 40px;
//     margin: 12px auto 0;
//   }
// }
</style>
