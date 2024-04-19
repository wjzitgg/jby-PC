import Vue from "vue";
import Vuex from "vuex";
import api from "../api/api";
import contractStore from "./module/contract";
import layoutStore from "./module/layout";
Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    user: {},
    routers: [],
    btnPemission: [],
    status: false,
    dictionariesData: [], // 后端字典数据 字典类型(短信模板：1-已作废，短信签名：2-已作废,短信错误信息：3，培训类型：4, 天气状态：5，流程类型：6，天气温度：7, 设计变更状态：8， 物料分类属性：9, 清单类型：10，供货类型：11 ,物资申请单：12，物资采购单：13,支付方式：14, 费用类清单:15,采购单类型：16，发料出库类型：17，发料出库状态：18,出库单状态:19,入库单状态:20,入库检测状态:21,入库单单据类型：22，供应商类型：23,变动类型：24,盘点单状态：25,出库对象：26 )
    tagsList: [],
    menuData: [],
    realNameVerify: "",
    logDialog: false,
    tokenSign: ""
  },
  mutations: {
    // 初始化动态路由
    initRoutes(state, data) {
      state.routers = data;
    },
    // 设置用户信息
    setUserinfo(state, data) {
      // 变更状态
      state.user = data;
      sessionStorage.setItem("user", JSON.stringify(data));
    },
    setBtnPemission(state, data) {
      state.btnPemission = data;
    },
    statusAlter(state, data) {
      state.status = data;
    },
    // 设置修改字典数据集合
    modificationDictionary(state, res) {
      state.dictionariesData = res;
    },
    setTagsList(state, data) {
      state.tagsList = data;
    },
    setMenuData(state, res) {
      state.menuData = res;
    },
    setRealNameVerify(state, res) {
      state.realNameVerify = res;
    },
    setLoginDialog(state, res) {
      state.logDialog = res;
    },
    setTokenSign(state, res) {
      state.tokenSign = res;
    }
  },
  // action是操作mutation触发commit修改state的方式
  actions: {
    // 异步调用
    getDictionariesData(context, num) {
      const obj = {
        dictType: num
      };
      // 请求接口
      if (store.state.dictionariesData.length) {
        return store.state.dictionariesData.filter(item => item.dictType === num)[0].sysDictList;
      } else {
        return new Promise(resolve => {
          api.getItemClass(obj).then(res => {
            if (res.code === 200) {
              resolve(res.data);
            }
          });
          // context.commit("modificationDictionary", result);
        });
      }
    },
    getMenuData(context, menuCode) {
      // contract：合同管理 ，schedule：进度管理，supplies：物资管理，updatePrice：物资管理的可编辑单价，settlement：计量管理
      // 请求接口
      if (store.state.menuData.length) {
        return store.state.menuData.filter(item => item.menuCode === menuCode)[0];
      } else {
        return new Promise(resolve => {
          api.searchMenuDataAuthorize().then(res => {
            if (res.code === 200) {
              resolve(res.data.filter(item => item.menuCode === menuCode)[0]);
            }
          });
          // context.commit("modificationDictionary", result);
        });
      }
    }
  },
  modules: {
    layout: layoutStore,
    contract: contractStore
  }
});

export default store;
