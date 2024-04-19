<template>
  <div class="tags" v-if="showTags">
    <ul>
      <li class="tags-li" v-for="(item, index) in tagsList" :class="{ active: isActive(item.path) }" :key="index">
        <router-link :to="item.path" class="tags-li-title">
          <!-- {{ item.title }} -->
          <span v-if="item.title != '首页'">{{ item.title }}</span>
          <i v-if="item.title == '首页'" class="iconfont iconhome">首页</i> 
        </router-link>
        <span class="tags-li-icon" @click="closeTags(index)" v-if="item.title != '首页'"><i class="el-icon-close"></i></span>
      </li>
    </ul>
    <div class="tags-close-box">
      <!-- <i class="el-icon-arrow-down el-icon--right"></i> -->
      <el-dropdown @command="handleTags">
        <el-button size="mini" class="tags-close-btn"> 标签选项 <img class="el-icon-arrow-down el-icon--right" src="../../../../assets/triangle.png" alt=""> </el-button>
        <el-dropdown-menu size="small" slot="dropdown">
          <el-dropdown-item command="other">关闭其他</el-dropdown-item>
          <el-dropdown-item command="all">关闭所有</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // tagsList: []setTagsList
    };
  },
  computed: {
    showTags() {
      return this.tagsList.length > 0;
    },
    tagsList() {
      return this.$store.state.tagsList;
    }
  },
  watch: {
    $route(newValue, oldValue) {
      this.setTags(newValue);
    }
  },
  created() {
    this.setTags(this.$route);
  },
  methods: {
    isActive(path) {
      return path === this.$route.fullPath;
    },
    // 关闭单个标签
    closeTags(index) {
      const delItem = this.tagsList.splice(index, 1)[0];
      const item = this.tagsList[index] ? this.tagsList[index] : this.tagsList[index - 1];
      if (item) {
        delItem.path === this.$route.fullPath && this.$router.push(item.path);
      } else {
        this.$router.push("/");
      }
    },
    // 关闭全部标签
    closeAll() {
      // this.tagsList = [{ path: "/home/home", title: "首页", name: "home" }];
      this.$store.commit("setTagsList", [{ path: "/home/home", title: "首页", name: "home" }]);
      this.$router.push("/home/home");
    },
    // 关闭其他标签
    closeOther() {
      const curItem = this.tagsList.filter(item => {
        return item.path === this.$route.fullPath;
      });
      if (curItem[0].title != "首页") {
        curItem.unshift({ path: "/home/home", title: "首页", name: "home" });
      }
      this.$store.commit("setTagsList", curItem);
      // this.tagsList = curItem;
    },
    // 设置标签
    setTags(route) {
      const isExist = this.tagsList.some(item => {
        return item.path === route.fullPath;
      });
      const arr = [...this.tagsList];
      if (!isExist) {
        if (arr.length >= 12) {
          arr.splice(1, 1);
        }
        arr.push({
          title: route.meta.title,
          path: route.fullPath,
          name: route.matched[1].components.default.name
        });
        if (arr[0].title != "首页") {
          arr.unshift({
            path: "/home/home",
            title: "首页",
            name: "home"
          });
        }
        this.$store.commit("setTagsList", arr);
      }
    },
    handleTags(command) {
      // return console.log(command)
      command === "other" ? this.closeOther() : this.closeAll();
    }
  }
};
</script>

<style lang="scss" scoped>
.tags {
  position: relative;
  height: 40px;
  /* overflow: hidden; */
  background: #fff;
  padding-right: 120px;
  /* box-shadow: 0 5px 10px #ddd; */
  padding-left: 20px;
  /* margin-left: 20px; */
}
.iconfont{
    //  color: #3f8dfd;
      font-size: 14px;
     
}
.tags ul {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}
.active {
  background-color: rgb(140, 120, 230);
}
.tags-li {
  float: left;
  font-size: 14px;
  overflow: hidden;
  cursor: pointer;
  height: 40px;
  line-height: 40px;
  background: #fff;
  padding: 0 42px 0 14px;
  vertical-align: middle;
  color: #5d5d5d;
  /* border-right: 1px solid #e3e3e3; */
  -webkit-transition: all 0.3s ease-in;
  -moz-transition: all 0.3s ease-in;
  transition: all 0.3s ease-in;
  position: relative;
}
.tags-li:first-child {
  padding: 0 14px;
}

.tags-li:not(.active):hover {
  color: #3f8dfd;
  background-color: #e7f4ff;
}

.tags-li.active {
  /* color: #fff;
  border: 1px solid #409eff; */
  /* background-color: #409eff; */
  color: #3f8dfd;
  background-color: #ffff;
  .tags-li-icon {
    border-right: none;
  }
}

.tags-li-title {
  float: left;
  max-width: 80px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #5d5d5d;

}
.tags-li-icon {
  position: absolute;
  right: 0;
  height: 18px;
  line-height: 18px;
  top: 11px;
  margin-left: 10px;
  border-right: 1px solid #e3e3e3;
  padding-right: 14px;
}
.tags-li.active .tags-li-title {
  color: #3f8dfd;
}

.tags-close-box {
  position: absolute;
  right: 34px;
  top: 6px;
  box-sizing: border-box;
  text-align: center;
  height: 30px;
  
  /* background: #fff; */
  /* box-shadow: -3px 0 15px 3px rgba(0, 0, 0, 0.1); */
  z-index: 10;
}
.tags-close-btn{
   display: flex;
   border: none;
   align-items: center;
}
.el-icon-arrow-down{
  width: 12px;
  height: 5.5px;
}

</style>
