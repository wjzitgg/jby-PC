import COS from 'cos-js-sdk-v5'
import {
  Message
} from 'element-ui'
import api from "@/api/api";
const config = {
  videoBucket: 'epms-1307524156',
  imageBucket: 'epms-1307524156',
  Region: 'ap-guangzhou'
}

// 上传到腾讯云cos
export function uploadObjectPdf(file, callback) {
  /* 1.获取临时秘钥data
   2.初始化
   3.判断上传文件的类型
   4.判断文件大小 是否需要分片上传*/
  const type = file.type.substring(0, 5)
  let fileName = file.name || ""
  const origin_file_name = fileName.split(".").slice(0, fileName.split(".").length - 1).join('.') // 获取文件名称
  // console.log('origin_file_name', origin_file_name)
  // 获取当前时间戳 与文件类型拼接 为cos.putObject里的参数Key
  const upload_file_name = new Date().getTime() + '.' + fileName.split(".")[fileName.split(".").length - 1] // 文件上传名称定义为当前时间戳
  // console.log('upload_file_name', upload_file_name)
  // 获取密钥
  // config.imgName = file.name + ".pdf";
//    console.log("=============================")
//    console.log(file)
//     console.log("=============================")
  api.getUploadFileToken()
    .then(response => { // 后台接口返回 密钥相关信息
      const data = response.data;
      // console.log(data);
      config.imgName = data.objectKey + ".pdf";
      // 初始化
      var cos = new COS({
        getAuthorization: (options, callback) => {
          callback({
            TmpSecretId: data.tmpSecretId,
            TmpSecretKey: data.tmpSecretKey,
            XCosSecurityToken: data.token,
            StartTime: data.startTime,
            ExpiredTime: data.expiredTime,
            // expiration: data.expiration,
            regionName: data.regionName,
          })
        },
      })
      // 获取上传文件大小
      let size = file.size
      let key = '/art/' + upload_file_name

      cos.putObject({
          Bucket: config.imageBucket, // 存储桶名称
          Region: config.Region, // 存储桶所在地域，必须字段
          Key: config.imgName, // 图片名称
          StorageClass: 'STANDARD',
          Body: file, // 上传文件对象
          onHashProgress: (progressData) => {
            console.log('校验中', JSON.stringify(progressData));
          },
          onProgress: (progressData) => {
            const percent = parseInt(progressData.percent * 10000) / 100;
            const speed = parseInt((progressData.speed / 1024 / 1024) * 100) / 100;
            console.log('进度：' + percent + '%; 速度：' + speed + 'Mb/s;');
            // console.log(progressData)
          },
        },
        (err, data) => {
          if (data && data.statusCode == 200) {
            let fileUrl = 'https://' + data.Location ;
            console.log("13724001741===========================")
            console.log(fileUrl)
            console.log("13724001741===========================")
            callback(fileUrl) // 返回图片链接地址和视频的原始名称  + '.file.myqcloud.com'
          } else {
            Message({
              message: '图片文件上传失败,请重新上传',
              type: 'error'
            })
          }
        }
      )

    })
}

export default {
  uploadObjectPdf
}
