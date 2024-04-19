// https://cloud.tencent.com/document/product/436/11459
import COS from 'cos-js-sdk-v5'
import { Message } from 'element-ui'
// import { getCOSSecretKey } from '@/api/common/index'
const config = {
    videoBucket: 'epms-1307524156',
    imageBucket: 'epms-1307524156',
    Region: 'ap-guangzhou'
}

// 上传到腾讯云cos
export function uploadObject(file, callback) {
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
        // getCOSSecretKey({ bucket: type === 'video' ? config.videoBucket : config.imageBucket })
        //     .then(response => { // 后台接口返回 密钥相关信息
        // const data = response.result
        // 获取临时秘钥
    this.$api.getUploadFileToken().then(res => {
        //获取秘钥成功后调用 上传到云服务器
        if (res.code == 200) {

        }
    })
    const data = {
        msg: "操作成功",
        bucketName: "epms-1307524156",
        endpoint: "https://epms-1307524156.cos.ap-guangzhou.myqcloud.com",
        code: 200,
        objectKey: "2022030916012962285eda36edea397a8757f5",
        regionName: "ap-guangzhou",
        token: "L2nb7EkhNql6iFahKhR3ONWJmtU6Ihwa839d9eb078b83a43ac15a99fbf175978BSGgiJYHmVY5StGl_VO24Li4JjNEHdgmwmT1yv5Ukq5Zlh8C5oZuk6K8FE2VC1LV3XsTJYnUSE88O1_UgdHVmVdwZNUCiZ8K_FY2izZwTMqtPwu7nuWoQd9GGMMOgh-bOLte0QE-MyVb5sSOLmBfbmokNdRHmUR21mGUzmmQmO_fbYUpdb3KW1-K2g3ZgOnuWlOojMmKOQTZWP0JgyOtWWslPhY55ENW_RaynqJv7WBDVADq0optI57vst-JKMiwyUZVyPxuZ9SooNpUy5ctSR8OMB_l9bHgQ7DoVYdiTsbYSEpfeYtfCJkxAzS67vjeidnHgNGc2uXBXNSXcNZOkHGiuKmA01ThNaG9R-5OqREvRzSe4h-yCs9BVmZ3sAaSlp0iaVn6NwYrfQV0Hm5A0Px3HUOhpE-zfuo7CFg_Vp7LnbRvSrsyYw3zDxj_8tfpcaJclxUnUk5MEyrohn7HHOEjMnX3qGhlT72C6sE6L_EvHRDwSPknmJ8SGhBu7LBlk-SNcPI-LXsuhCyVun5GQA52oFrYQURkO-U5P9ebIlnmWvWNaR9JEZZu_ZCUwLAa"
    }
    var credentials = data && data.credentials


    if (!data || !credentials) return console.error('credentials invalid')
        // 初始化
    var cos = new COS({
            getAuthorization: (options, callback) => {
                callback({
                    TmpSecretId: credentials.tmpSecretId,
                    TmpSecretKey: credentials.tmpSecretKey,
                    XCosSecurityToken: credentials.sessionToken,
                    StartTime: data.startTime,
                    ExpiredTime: data.expiredTime,
                    expiration: data.expiration,
                    requestId: data.requestId,

                })
            },
        })
        // 获取上传文件大小
    let size = file.size
    let key = '/art/' + upload_file_name
    if (type === 'video') {
        // console.log(size / (1024 * 2024))
        if (size / (1024 * 1024) < 50) {
            console.log('视频普通上传')
            cos.putObject({
                    Bucket: config.videoBucket, // 存储桶名称
                    Region: config.Region, // 存储桶所在地域，必须字段
                    Key: key, // 视频名称
                    StorageClass: 'STANDARD',
                    Body: file, // 上传文件对象
                    onHashProgress: (progressData) => {
                        // console.log('校验中', JSON.stringify(progressData))
                    },
                    onProgress: (progressData) => {
                        const percent = parseInt(progressData.percent * 10000) / 100;
                        const speed = parseInt((progressData.speed / 1024 / 1024) * 100) / 100;
                        console.log('进度：' + percent + '%; 速度：' + speed + 'Mb/s;');
                    },
                },
                (err, data) => {
                    console.log('data', data)
                    if (err) {
                        console.log('err', err)
                        Message({ message: '视频文件上传失败,请重新上传', type: 'error' })
                    } else {
                        let fileUrl = 'https://' + config.videoBucket + '.file.myqcloud.com' + key
                        callback(fileUrl, origin_file_name) // 返回视频链接地址和视频的原始名称
                    }
                }
            )
        } else {
            console.log('视频分块上传')
                // 上传分块
            cos.sliceUploadFile({
                    Bucket: config.videoBucket, // 存储桶名称
                    Region: config.Region, // 存储桶所在地域，必须字段
                    Key: key /* 必须 */ ,
                    Body: file,
                    onTaskReady: (taskId) => {
                        /* 非必须 */
                        // console.log(taskId)
                    },
                    onHashProgress: (progressData) => {
                        /* 非必须 */
                        // console.log(JSON.stringify(progressData))
                    },
                    onProgress: function(progressData) {
                        const percent = parseInt(progressData.percent * 10000) / 100;
                        const speed = parseInt((progressData.speed / 1024 / 1024) * 100) / 100;
                        console.log('进度：' + percent + '%; 速度：' + speed + 'Mb/s;');
                    },
                },
                (err, data) => {
                    if (err) {
                        console.log(err)
                        Message({ message: '文件上传失败,请重新上传', type: 'error' })
                    } else {
                        let fileUrl = 'https://' + config.videoBucket + '.file.myqcloud.com' + key
                        callback(fileUrl, origin_file_name) // 返回视频链接地址和视频的原始名称
                    }
                }
            )
        }
    } else if (type === 'image') {
        cos.putObject({
                Bucket: config.imageBucket, // 存储桶名称
                Region: config.Region, // 存储桶所在地域，必须字段
                Key: key, // 图片名称
                StorageClass: 'STANDARD',
                Body: file, // 上传文件对象
                onHashProgress: (progressData) => {
                    console.log('校验中', JSON.stringify(progressData))
                },
                onProgress: (progressData) => {
                    const percent = parseInt(progressData.percent * 10000) / 100;
                    const speed = parseInt((progressData.speed / 1024 / 1024) * 100) / 100;
                    console.log('进度：' + percent + '%; 速度：' + speed + 'Mb/s;');
                },
            },
            (err, data) => {
                console.log(data)
                if (data && data.statusCode == 200) {
                    let fileUrl = 'https://' + config.imageBucket + '.file.myqcloud.com' + key
                    callback(fileUrl) // 返回图片链接地址和视频的原始名称
                } else {
                    Message({ message: '图片文件上传失败,请重新上传', type: 'error' })
                }
            }
        )
    }
    // })
}

export default {
    uploadObject
}
// ————————————————
// 版权声明：本文为CSDN博主「＊且听风吟」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
// 原文链接：https://blog.csdn.net/HH18700418030/article/details/121795767