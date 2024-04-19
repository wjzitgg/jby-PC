import router, {
  resetRouter
} from "./router";

// import { Message } from 'element-ui'
// const _import = require("./router/_import_" + process.env.NODE_ENV); // 获取组件的方法
import api from "@/api/api";
import Layout from "@/views/layout"; // Layout 是架构组件，不在后台返回，在文件里单独引入
import store from "./store";

let getRouter; // 用来获取后台拿到的路由
let endTo = true;
// 白名单
const whiteRouter = ["/login", "/forgetPassword", "/registry", "/404", "*"]; // indexOf方法，判断数组中是否存在指定的某项，如果不存在，则返回-1
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem("token") ? sessionStorage.getItem("token") : sessionStorage.getItem("token");
  // 如果跳转登录
  if (token) {
    if (to.path === "/login") {
      const str1 = sessionStorage.getItem("restoken");
      const str2 = sessionStorage.getItem("selOpen");
      const str3 = sessionStorage.getItem("accountList");
      const str4 = sessionStorage.getItem("ruleForm");
      const str5 = sessionStorage.getItem("personalCertificateShow");
      const str6 = sessionStorage.getItem("registryData");
      // localStorage.clear();
      sessionStorage.clear();
      store.commit("setLoginDialog", false);
      if (str2 == 1) {
        sessionStorage.setItem("restoken", str1);
        sessionStorage.setItem("selOpen", str2);
        sessionStorage.setItem("accountList", str3);
        sessionStorage.setItem("ruleForm", str4);
      }
      if (str5 == 1) {
        sessionStorage.setItem("restoken", str1);
        sessionStorage.setItem("selOpen", str2);
        sessionStorage.setItem("accountList", str3);
        sessionStorage.setItem("ruleForm", str4);
        sessionStorage.setItem("personalCertificateShow", str5);
        sessionStorage.setItem("registryData", str6);
      }
      getRouter = "";
      next();
    } else {
      if (to.path === "/empty" && endTo) {
        getRouter = "";
        api.getRoute().then(res => {
          // console.log("路由信息", res);
          store.commit("initRoutes", res.data);
          const arrAny = [];
          saveObjArr("personalDetails", []);
          res.data.forEach(item => {
            if (item.name != "首页") {
              arrAny.push(item);
            } else {
              saveObjArr("personalDetails", item.children);
              saveObjArr("home", item);
            }
          });
          // getRouter = res.data; // 假装模拟后台请求得到的路由数据
          getRouter = arrAny;
          let arr1 = JSON.stringify(arrAny);
          arr1 = JSON.parse(arr1);
          const arrAy = [];
          arr1.forEach(item => {
            if (item.isGroup == true) {
              item.children.forEach(e => {
                e.show = true;
                arrAy.push(e);
              });
            }
          });
          getRouter = [...arrAy, ...getRouter];
          // getRouter = fakeRouter //假装模拟后台请求得到的路由数据
          saveObjArr("router", getRouter); // 存储路由到localStorage
          routerGo(to, next); // 执行路由跳转方法
        });
        // getRouter = getObjArr("router"); // 拿到路由
        // routerGo("/index", next);
        return;
      }
      // return next();
      if (!getRouter) {
        // 不加这个判断，路由会陷入死循环
        // 1.获取本地有没有存储路由 1.1没有就发送接口取路由
        if (!getObjArr("router")) {
          api.getRoute().then(res => {
            // console.log("路由信息", res);
            store.commit("initRoutes", res.data);
            const arrAny = [];
            saveObjArr("personalDetails", []);
            res.data.forEach(item => {
              if (item.name != "首页") {
                arrAny.push(item);
              } else {
                saveObjArr("personalDetails", item.children);
                saveObjArr("home", item);
              }
            });
            // getRouter = res.data; // 假装模拟后台请求得到的路由数据
            getRouter = arrAny;
            // getRouter = fakeRouter //假装模拟后台请求得到的路由数据
            let arr1 = JSON.stringify(arrAny);
            arr1 = JSON.parse(arr1);
            const arrAy = [];
            arr1.forEach(item => {
              if (item.isGroup == true) {
                item.children.forEach(e => {
                  e.show = true;
                  arrAy.push(e);
                });
              }
            });
            getRouter = [...arrAy, ...getRouter];
            saveObjArr("router", getRouter); // 存储路由到localStorage

            routerGo(to, next); // 执行路由跳转方法
          });
        } else {
          // 1.2有从localStorage拿到了路由
          getRouter = getObjArr("router"); // 拿到路由
          routerGo(to, next);
        }
      } else {
        next();
      }
    }
  } else {
    if (whiteRouter.indexOf(to.path) !== -1) {
      // 当to.path == '/login' 的时候，存在，执行next(),跳到login页面,不触发beforeEach
      next(); // 指向(进入)to钩子--进入下一个页面
    } else {
      next("/login"); // 发生路由指向变化
    }
  }
});

function routerGo(to, next) {
  // getRouter = filterAsyncRouter(getRouter) //过滤路由
  getRouter = generaMenu(getRouter);
  getRouter.unshift({
    name: "",
    path: "/home",
    component: Layout,
    meta: {
      title: "首页",
      icon: "home"
    },
    children: [{
      name: "首页",
      path: "home",
      component: () => import("@/views/home.vue"),
      meta: {
        title: "首页",
        icon: "home"
      }
    }]
  });
  // 动态添加路由
  if (to.path === "/empty") {
    resetRouter();
  }
  router.addRoutes(getRouter);
  global.antRouter = getRouter; // 将路由数据传递给全局变量，做侧边栏菜单渲染工作
  if (to.path === "/empty") {
    endTo = false;
    setTimeout(() => {
      endTo = true;
    }, 1000);
    next({
      ...to
    });
  } else {
    next({
      ...to,
      replace: true
    });
  }
}

function saveObjArr(name, data) {
  // localStorage 存储数组对象的方法
  // localStorage.setItem(name, JSON.stringify(data))
  sessionStorage.setItem(name, JSON.stringify(data));
}

function getObjArr(name) {
  // localStorage 获取数组对象的方法
  return JSON.parse(window.sessionStorage.getItem(name));
  // sessionStorage.getItem(key)
}

function generaMenu(data) {
  // eslint-disable-next-line prefer-const
  let fmtRoutes = [];
  data.forEach(item => {
    const menu = {
      path: item.path,
      component: item.component == "Layout" ? Layout : () => import(`@/views/${item.component}.vue`),
      children: item.children,
      name: item.name,
      meta: {
        title: item.meta.title,
        icon: item.meta.icon,
        menuIcon: item.meta.menuIcon,
        selectedIcon: item.meta.selectedIcon,
        isGroup: item.isGroup == undefined ? false : item.isGroup,
        show: item.show == undefined ? false : item.show
      }
    };
    if (menu.children && menu.children instanceof Array) {
      // 递归
      menu.children = generaMenu(item.children);
    }

    fmtRoutes.push(menu);
  });
  return fmtRoutes;
}
