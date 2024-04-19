import { jsonp } from "@/api/http";
/**
 *  树形结构转扁平型数据
 * @param {Array} arrs 树形数据
 * @param {string} childs 树形数据子数据的属性名,常用'children'
 * @param {Array} attrArr 需要提取的公共属性数组
 * @returns
 */
export function extractTree(arrs, childs, attrArr) {
  let attrList = [];
  if (!Array.isArray(arrs) && !arrs.length) return [];
  if (typeof childs !== "string") return [];
  if (!Array.isArray(attrArr) || (Array.isArray(attrArr) && !attrArr.length)) {
    attrList = Object.keys(arrs[0]);
    attrList.splice(attrList.indexOf(childs), 1);
  } else {
    attrList = attrArr;
  }
  const list = [];
  const getObj = arr => {
    arr.forEach(function(row) {
      const obj = {};
      attrList.forEach(item => {
        obj[item] = row[item];
      });
      list.push(obj);
      if (row[childs]) {
        getObj(row[childs]);
      }
    });
    return list;
  };
  return getObj(arrs);
}
/** 扁平型转树形 */
export function listToTree(list, myId) {
  const children = [];
  list.forEach(item => {
    if (item.pid === myId) {
      item.prodItemListAdds = listToTree(list, item.myId);
      children.push(item);
    }
  });
  return children;
}
/** 上传方法 */
export function upLoad(list) {
  this.$api.getUploadFileToken().then(res => {
    if (res.code == 200) {
      const blobFile = this.dataURLtoBlob(list);
      sign = res.token;
      path = res.endpoint;
      this.uploadDate = res;
      return this.$options.methods.upLoads.bind(this)(sign, path, blobFile, filename, res.tmpSecretKey, res.tmpSecretId, res.startTime, res.expiredTime);
    }
  });
}
export function dataURLtoBlob(fileObj) {
  return new Blob([fileObj], { type: fileObj.type });
}
export function upLoads(sign, folder, file, filename, tmpSecretKey, tmpSecretId, startTime, expiredTime) {
  const bucket = "epms-1307524156";
  const appid = "1256287502";
  const region = "ap-guangzhou";
  const cos = new COS({
    // 必选参数
    getAuthorization: function(options, callback) {
      callback({
        TmpSecretId: tmpSecretId,
        TmpSecretKey: tmpSecretKey,
        XCosSecurityToken: sign,
        // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
        StartTime: startTime, // 时间戳，单位秒，如：1580000000
        ExpiredTime: expiredTime, // 时间戳，单位秒，如：1580000900
        ScopeLimit: true
      });
    },
    // 可选参数
    FileParallelLimit: 3000, // 控制文件上传并发数
    ChunkParallelLimit: 3000, // 控制单个文件下分片上传并发数
    ProgressInterval: 1000 // 控制上传的 onProgress 回调的间隔
  });

  const _this = this;
  cos.uploadFile(
    {
      Bucket: bucket,
      Region: region,
      Key: _this.uploadDate.objectKey,
      Body: file,
      onProgress: function(progressData) {
        console.log(JSON.stringify(progressData));
      }
    },
    function(err, data) {
      console.log("Xxxxxxxxxxxxxxx");
      console.log(data || err);
      console.log("Xxxxxxxxxxxxxxx");
      if (data.statusCode == 200) {
        const path = "https://" + data.Location;
        return path;
      }
    }
  );
}

// 判断文件类型
export function getFileType(fileName) {
  let suffix = ""; // 后缀获取
  let result = ""; // 获取类型结果
  if (fileName) {
    const flieArr = fileName.split("."); // 根据.分割数组
    suffix = flieArr[flieArr.length - 1]; // 取最后一个
  }
  if (!suffix) return false; // fileName无后缀返回false
  suffix = suffix.toLocaleLowerCase(); // 将后缀所有字母改为小写方便操作
  // 匹配图片
  const imgList = ["png", "jpg", "jpeg", "bmp", "gif"]; // 图片格式
  result = imgList.find(item => item === suffix);
  if (result) return "image";
  // 匹配txt
  const txtList = ["txt"];
  result = txtList.find(item => item === suffix);
  if (result) return "txt";
  // 匹配excel
  const excelList = ["xls", "xlsx"];
  result = excelList.find(item => item === suffix);
  if (result) return "excel";
  // 匹配word
  const wordList = ["doc", "docx"];
  result = wordList.find(item => item === suffix);
  if (result) return "word";
  // 匹配pdf
  const pdfList = ["pdf"];
  result = pdfList.find(item => item === suffix);
  if (result) return "pdf";
  // 匹配ppt
  const pptList = ["ppt", "pptx"];
  result = pptList.find(item => item === suffix);
  if (result) return "ppt";
  // 匹配zip
  const zipList = ["rar", "zip", "7z"];
  result = zipList.find(item => item === suffix);
  if (result) return "zip";
  // 匹配视频
  const videoList = ["mp4", "m2v", "mkv", "rmvb", "wmv", "avi", "flv", "mov", "m4v"];
  result = videoList.find(item => item === suffix);
  if (result) return "video";
  // 匹配音频
  const radioList = ["mp3", "wav", "wmv"];
  result = radioList.find(item => item === suffix);
  if (result) return "radio";
  // 其他文件类型
  return "other";
}

// 腾讯地图通过详情地址获取经纬度
export function getPos(address) {
  return jsonp(`https://apis.map.qq.com/ws/geocoder/v1/?address=${address}&key=TMVBZ-L26WU-5K2VR-4KQNM-X4K7O-ASB4R&output=jsonp&callback=jsonCallBack`);
}
// 腾讯地图通过详情地址获取经纬度 location= 39.984154,116.307490
export function getLat(location) {
  return jsonp(`https://apis.map.qq.com/ws/geocoder/v1/?location=${location}&key=TMVBZ-L26WU-5K2VR-4KQNM-X4K7O-ASB4R&output=jsonp&callback=jsonCallBack`);
}

export function getStringImgSrc(str) {
  const imgReg = /<img.*?(?:>|\/>)/gi;
  const srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
  if (!str) {
    return [];
  }
  const arr = str.match(imgReg);
  const returnArr = [];
  if (!arr || !arr.length) {
    return returnArr;
  }
  for (let i = 0; i < arr.length; i++) {
    returnArr.push(arr[i].match(srcReg)[1]);
  }
  return returnArr;
}
// 数字输入框方法
/**
 * 输入框限制输入 只允许输入数字
 * value 数值 必填
 * max 最大值 选填
 * min 最小值 选填
 * length 小数点保留位数 选填
 * isBlur 失去焦点触发
 */
export function limitInputNumber(value, max = null, min = null, length = null, isBlur = false, isMoney = false) {
  if (!value && value !== 0) {
    return min >= 0 ? min : null;
  }
  // 是否需要保留小数
  value = value.toString();
  if (!length) {
    if (max < 0 || min < 0) {
      value = value.replace(/[^\-\d]+/g, "");
    } else {
      value = value.replace(/[^0-9]/gi, "");
    }
  } else {
    // 保留数字和小数点
    if (max < 0 || min < 0) {
      value = value.replace(/[^\-\d^\.]+/g, "");
    } else {
      value = value.replace(/[^\d^\.]+/g, "");
    }
    if (value.indexOf(".") > 0) {
      value = value.slice(0, value.indexOf(".") + (length + 1));
    } else if (value.indexOf(".") === 0 && value.length === 1) {
      value = 0 + value;
    } else if (value.indexOf(".") === value.length - 1 && value.length != 0 && isBlur) {
      value = value.substring(0, value.length - 1);
    }
  }
  if (max || Number(max) === 0) {
    max = Number(max);
    const tempValue = Number(value);
    if (tempValue > max) {
      value = max;
    }
  }
  if (min || Number(min) === 0) {
    min = Number(min);
    const tempValue = Number(value);
    if (tempValue < min) {
      value = min;
    }
  }
  if (isMoney) {
    for (let i = 0; i < value.length; i++) {
      if (value[i] === ".") {
        break;
      }
      if (value[i] == 0 && value[i + 1] !== "." && i == 0) {
        value = value.slice(i + 1, value.length - 1);
        i--;
      }
    }
  }
  if (isBlur) {
    return Number(value);
  } else {
    return value;
  }
}
export function limitPhone(value) {
  let val = value;
  val = val.slice(0, 20);
  val = val.replace(/[^\d+-]/g, "");
  return val;
}
export function limitPhone2(value) {
  console.log(value);
  let val = value;
  // val = val.slice(0, 11);
  val = val.replace(/\D|^''/g, "");
  return val;
}
export function limitNums(value, length = 50) {
  let val = value;
  val = val.slice(0, length);
  val = val.replace(/[^\d+-]/g, "");
  // val=val.replace(/[\u4E00-\u9FA5]/g,'') //非中文
  return val;
}
