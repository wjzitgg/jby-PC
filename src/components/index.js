import SearchBar from "./SearchBar/SearchBar"; // 搜索栏
import controlBar from "./controlBar.vue"; // 页面操作
import tablePaging from "./tablePaging.vue"; // 分页
import proSelct from "./proTreeSelect/treeSelect.vue";
import pictureUpload from "./pictureUpload"; // 照片上传
const commonComponents = {
  install(Vue) {
    Vue.component("SearchBar", SearchBar); // 搜索栏
    Vue.component("controlBar", controlBar); // 页面操作
    Vue.component("tablePaging", tablePaging); // 分页
    Vue.component("proSelct", proSelct); // 分页
  }
};
export default commonComponents;
