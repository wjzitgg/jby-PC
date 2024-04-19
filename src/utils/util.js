import pako from "pako";
import { Base64 } from "js-base64";
export default {
  // 下载单个文件转换二进制文件流再下载
  fileLinkToStreamDownload: (url, fileName, type) => {
    const reg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+).)+([A-Za-z0-9-~\/])+$/;
    if (!reg.test(url)) {
      throw new Error("传入参数不合法,不是标准的文件链接");
    } else {
      const xhr = new XMLHttpRequest();
      xhr.open("get", url, true);
      xhr.setRequestHeader("Content-Type", `application/${type}`);
      xhr.responseType = "blob";
      xhr.onload = function() {
        if (this.status == 200) {
          // 接受二进制文件流
          // console.log(this);
          const blob = this.response;
          const blobUrl = window.URL.createObjectURL(blob);
          // 这里的文件名根据实际情况从响应头或者url里获取
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(blobUrl);
        }
      };
      xhr.send();
    }
  },
  // 压缩
  zip(data) {
    if (!data) return data;
    // 判断数据是否需要转为JSON
    const dataJson = typeof data !== "string" && typeof data !== "number" ? JSON.stringify(data) : data;

    // 使用Base64.encode处理字符编码，兼容中文
    const str = Base64.encode(dataJson);
    let binaryString = pako.gzip(str);
    let arr = Array.from(binaryString);
    let s = "";
    arr.forEach((item, index) => {
      s += String.fromCharCode(item);
    });
    return btoa(s);
  },
  // 解压
  unzip(b64Data) {
    let strData = atob(b64Data);
    let charData = strData.split("").map(function(x) {
      return x.charCodeAt(0);
    });
    let binData = new Uint8Array(charData);
    let data = pako.ungzip(binData);

    // ↓切片处理数据，防止内存溢出报错↓
    let str = "";
    const chunk = 8 * 1024;
    let i;
    for (i = 0; i < data.length / chunk; i++) {
      str += String.fromCharCode.apply(null, data.slice(i * chunk, (i + 1) * chunk));
    }
    str += String.fromCharCode.apply(null, data.slice(i * chunk));
    // ↑切片处理数据，防止内存溢出报错↑

    const unzipStr = Base64.decode(str);
    let result = "";

    // 对象或数组进行JSON转换
    try {
      result = JSON.parse(unzipStr);
    } catch (error) {
      if (/Unexpected token o in JSON at position 0/.test(error)) {
        // 如果没有转换成功，代表值为基本数据，直接赋值
        result = unzipStr;
      }
    }
    return result;
  },
  // 导出
  downFile(url, fileName) {
    const x = new XMLHttpRequest();
    x.open("GET", url, true);
    x.responseType = "blob";
    x.onload = function () {
      const url = window.URL.createObjectURL(x.response);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
    };
    x.send();
  },
  dataURLtoFile(dataurl, filename) {
    let arr = dataurl.split(","), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length,u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
};
