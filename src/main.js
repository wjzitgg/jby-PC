/* eslint-disable import/first */
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import router from "./router";
import ElementUI from "element-ui";
import "@/utils/global"; // 全局
import "./promission"; // 这里进行路由后台获取的模拟
import "element-ui/lib/theme-chalk/index.css";
// import "./styles/index.scss"; // global css
import "@/styles/element-ui.scss";
import commonComponents from "./components/index"; // 通用组件引入
import api from "@/api/api";
Vue.prototype.$api = api;
// 全局公用方法挂载全局
import utils from "./utils/util";
Vue.prototype.utils = utils;
import { limitInputNumber, limitPhone, limitNums, limitPhone2 } from "./utils/commond";
Vue.prototype.$limitInputNumber = limitInputNumber;
Vue.prototype.$limitPhone = limitPhone;
Vue.prototype.$limitNums = limitNums;
Vue.prototype.$limitPhone2 = limitPhone2;
import store from "./store";
import plTable from "pl-table";

Vue.use(plTable);
// 以下为bpmn工作流绘图工具的样式
import "bpmn-js/dist/assets/diagram-js.css"; // 左边工具栏以及编辑节点的样式
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
import "bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css"; // 右边工具栏样式

import moment from "moment";
import rules from "@/utils/rules";

import "babel-polyfill";
import "./utils/directives";
///
// import "./package/theme/index.scss";
// import "./package/theme/element-variables.scss";
// import { vuePlugin } from "./package/highlight";
// import "highlight.js/styles/atom-one-dark-reasonable.css";
// Vue.use(vuePlugin);
// import MyPD from "./package/index.js";
// Vue.use(MyPD);

/** 权限指令,对按钮权限的控制 **/
const has = Vue.directive("has", {
  inserted: function(el, binding) {
    if (!Vue.prototype.$_has(binding.value)) {
      el.parentNode.removeChild(el);
    }
  }
});
// 权限检查方法（且把该方法添加到vue原型中）
Vue.prototype.$_has = function(value) {
  let isExist = false;
  // 从浏览器缓存中获取权限数组（该数组在登入成功后拉取用户的权限信息时保存在浏览器的缓存中）
  const buttonpermsStr = JSON.parse(sessionStorage.getItem("user") || "{}").permissions;
  if (buttonpermsStr == undefined || buttonpermsStr == null) {
    return false;
  }
  if (buttonpermsStr.indexOf(value) >= 0) {
    // 若在按钮中定义的权限字段能在后端返回的权限数组中能找到，则该按钮可显示
    isExist = true;
  }
  return isExist;
};
export { has };

// 引入echarts
import * as echarts from "echarts";
Vue.prototype.$echarts = echarts;
// import { request } from "http";
Vue.prototype.$rules = rules;
import "default-passive-events";
import SlideVerify from "vue-monoplasty-slide-verify";
Vue.use(SlideVerify);
// console.log('initMenu',initMenu(router,store))
Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.use(commonComponents);
Vue.prototype.$moment = moment;
/* eslint-disable no-new */
new Vue({
  el: "#app",
  router,
  store,
  components: { App },
  template: "<App/>"
});
