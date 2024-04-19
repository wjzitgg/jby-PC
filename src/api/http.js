// http.js
import axios from "axios";
import router from "../router";
import { Message, MessageBox } from "element-ui";
import store from "../store/index";
const agreement = location.protocol; // 获取http协议
// 环境的切换
if (process.env.NODE_ENV === "development") {
  // axios.defaults.baseURL = "/api";
  axios.defaults.baseURL = "http://192.168.2.16:9199"; // 测试环境接口、
  // axios.defaults.baseURL = "http://192.168.2.16:19199"; // bug环境接口
  // axios.defaults.baseURL = "http://192.168.2.16:39199"; // 开发环境接口
  // axios.defaults.baseURL = "http://192.168.2.16:29199"; // 开发环境接口
} else if (process.env.NODE_ENV === "production") {
  axios.defaults.baseURL = "http://192.168.2.16:9199"; // 测试环境接口
  // axios.defaults.baseURL = "http://192.168.2.16:19199"; // bug开发环境接口
  // axios.defaults.baseURL = "http://192.168.2.16:29199"; // 后端开发环境接口
  // axios.defaults.baseURL = agreement + "//erp.jianwangkeji.cn/gateway"; // 生产环境接口
}
let checkToken = true;

// 请求拦截器
axios.interceptors.request.use(
  config => {
    localStorage.setItem("httpurl", axios.defaults.baseURL);
    const token = sessionStorage.getItem("token") ? sessionStorage.getItem("token") : "";
    if (token !== "" && token !== null && token !== undefined) {
      config.headers.Authorization = token;
    }
    return config;
  },
  error => {
    return Promise.error(error);
  }
);

// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8";
// 响应拦截器
axios.interceptors.response.use(
  response => {
    if (response.status === 200) {
      if (response.data.code === 503 || response.data.code === 504 || response.data.code === 510) {
        // 未授权调取授权接口
        if (checkToken) {
          // Message.error("登陆已过期");
          checkToken = false;
          MessageBox.alert(response.data.msg, "账号退出提示", {
            confirmButtonText: "重新登录",
            cancelButtonText: "返回首页",
            type: "warning",
            showClose: false,
            showCancelButton: true,
            callback: action => {
              if (action == "cancel") {
                router.push("/login");
                checkToken = true;
              } else {
                store.commit("setLoginDialog", true);
                store.commit("setTokenSign", response.data.data);
                checkToken = true;
              }
            }
          });
        }

        return Promise.reject(response);
      } else if (response.data.code === 500 || response.data.code === 506 || response.data.code === 508 || response.data.code === 509) {
        // 未授权调取授权接口
        Message.error("系统内部错误");
      } else if (response.data.code === 501) {
        // 未授权调取授权接口
        Message.error("系统繁忙，请稍后再试");
      } else {
        return Promise.resolve(response);
      }
    } else {
      return Promise.reject(response);
    }
  },
  error => {
    // 我们可以在这里对异常状态作统一处理
    if (error.response) {
      // switch (error.response.status) {
      //     case 500:
      //         error.msg = "服务器"
      //         break;
      //     case 501:
      //         error.msg = "系统内部错误"
      //         break;
      // }
      return Promise.reject(error.response);
    }
  }
);

// get 请求
export function httpGet({ url, params = {} }) {
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        params
      })
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

// post请求
export function httpPost({ url, data }) {
  return new Promise((resolve, reject) => {
    axios({
      url,
      method: "post",
      // transformRequest: [function (data) {
      //   let ret = ''
      //   for (let it in data) {
      //     ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
      //   }
      //   return ret
      // }],
      // 发送的数据
      data
    })
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

// put请求
export function httpPut({ url, params, data }) {
  return new Promise((resolve, reject) => {
    axios({
      url,
      method: "put",
      params,
      data
    })
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

// delete请求
export function httpDelete({ url, params }) {
  return new Promise((resolve, reject) => {
    axios({
      url,
      method: "delete",
      params
    })
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

// jsonp请求
export function jsonp(url) {
  return new Promise((resolve, reject) => {
    // 这里的 "jsonCallBack" ，和调用的 jsonp 的 url 中的 callback 值相对应（见粗体字）
    window.jsonCallBack = result => {
      resolve(result);
    };
    const JSONP = document.createElement("script");
    JSONP.type = "text/javascript";
    JSONP.src = url;
    document.getElementsByTagName("head")[0].appendChild(JSONP);
    setTimeout(() => {
      document.getElementsByTagName("head")[0].removeChild(JSONP);
    }, 500);
  });
}
