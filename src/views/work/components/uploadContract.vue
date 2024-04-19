<template>
  <div class="picture-upload-comp" :class="photoClass">
    <div class="upload-bd">
      <div
        :key="index"
        class="el-upload-list"
        v-for="(file, index) in fileList"
      >
        <img
          :src="file"
          alt
          class="el-upload-list__item-thumbnail"
          style="height:100%"
        />
        <span class="el-upload-list__item-actions">
          <span
            @click="handlePictureCardPreview(file)"
            class="el-upload-list__item-preview"
          >
            <i class="el-icon-zoom-in"></i>
          </span>
          <span
            @click="handleRemove(file)"
            class="el-upload-delete"
            v-if="showUpload"
          >
            <i class="el-icon-delete"></i>
          </span>
        </span>
      </div>
      <el-upload
        style="width:100%"
        :accept="accept"
        :http-request="uploadFile"
        :limit="limit"
        :multiple="multiple || false"
        :on-error="uploadError"
        :on-remove="handleRemove"
        :show-file-list="false"
        action
        list-type="picture-card"
        ref="upload"
        v-if="fileList.length == 0"
      >
        <i class="el-icon-upload" slot="default"></i>
         <p  class="el-upload__text" slot="tip">上传签章</p>
      </el-upload>
      <!-- <el-tooltip v-if="uploadTip && showUpload" class="item"  effect="light" placement="right" >
        <div slot="content" v-html="$xss(uploadTip)"></div>
        <i class="el-icon-info tips" ></i>
      </el-tooltip> -->
    </div>
    <!-- <p class="tips" v-if="showUpload" >{{tip}}</p> -->
    <el-dialog
      :visible.sync="dialogVisible"
      :modal="false"
      :title="viewTitle || '预览图片'"
    >
      <div>
        <img :src="dialogImageUrl" alt width="100%" />
      </div>
    </el-dialog>
  </div>
</template>
<script>
import COS from "cos-js-sdk-v5";
export default {
  name: "pictureUpload",
  props: {
    accept: {
      default: "image/gif,image/jpeg,image/png,image/jpg"
    },
    apiName: {
      default: "uploadFile"
    },
    limit: {
      default: 1
    },
    size: {
      default: 10
    },
    multiple: {
      default: false
    },
    fileList: {
      default: () => []
    },
    viewTitle: {
      type: String
    },
    imgStatus: {
      default: false
    },
    formData: {
      default() {
        return {
          fileKey: "uploadFile"
        };
      }
    },
    primaryKey: {
      type: String,
      default: null
    },
    photoClass: {
      type: String,
      defult: ""
    },
    uploadTip: {
      default: () => "仅支持PNG JPG GIF格式,单张不超过10M"
    },
    tip: {
      default: () => "仅支持PNG JPG GIF格式,单张不超过2M"
    },
    showUpload: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      dialogImageUrl: "",
      dialogVisible: false,
      uploadDate: {}
    };
  },
  methods: {
    showMessage(msg) {
      this.$message.closeAll();
      this.$message.warning(msg);
    },
    // 文件上传
    handleRemove(file) {
      const list = this.fileList;
      list.splice(
        list.findIndex(item => file == item.filePath),
        1
      );
      console.log(this.fileList);
      this.$emit("onSuccess", "");
    },
    uploadError() {
      this.$message.warning("上传失败");
    },
    async uploadFile(files) {
      const self = this;
      const size = files.file.size / 1024 / 1024;
      if (
        self.accept &&
        self.accept.indexOf(files.file.type.split("/").reverse()[0]) < 0
      ) {
        self.showMessage(`上传文件格式有误，请重新选择`);
        self.$refs.upload.clearFiles();
        return;
      }
      if (self.fileList.length >= self.limit) {
        self.showMessage(`上传图片不能超过${self.limit}个`);
        self.$refs.upload.clearFiles();
        return;
      }
      if (size > self.size) {
        self.showMessage(`上传图片最大不能超过${self.size}M`);
        self.$refs.upload.clearFiles();
        return;
      }

      if (this.imgStatus == true) {
        const formData = new FormData();
        formData.append("file", files.file);
        this.$api.uploadFile(formData).then(res => {
          if (res.code == 200) {
            this.$emit("onSuccess", [res.imgUrl]);
          } else {
            return this.$message({
              type: "error",
              message: res.msg
            });
          }
        });
      } else {
        let blobFile = this.dataURLtoBlob(files.file);
        let filename = files.file.name;
        this.$api.getUploadFileToken().then(res => {
          if (res.code == 200) {
            let sign = res.token;
            let path = res.endpoint;
            this.uploadDate = res;
            this.upLoads(
              sign,
              path,
              blobFile,
              filename,
              res.tmpSecretKey,
              res.tmpSecretId,
              res.startTime,
              res.expiredTime
            );
          } else {
            this.uploadError();
          }
        });
      }
    },
    //DataURL转Blob
    dataURLtoBlob(fileObj) {
      return new Blob([fileObj], { type: fileObj.type });
    },
    //获取签名
    upLoads(
      sign,
      folder,
      file,
      filename,
      tmpSecretKey,
      tmpSecretId,
      startTime,
      expiredTime
    ) {
      let bucket = "epms-1307524156";
      let appid = "1256287502";
      let region = "ap-guangzhou";
      let cos = new COS({
        // 必选参数
        getAuthorization: function(options, callback) {
          callback({
            // Authorization: sign,
            // XCosSecurityToken: data.XCosSecurityToken, // 如果是临时密钥计算出来的签名，需要提供 XCosSecurityToken
            //  TmpSecretId:sign,
            // TmpSecretKey: "AKIDCuJYlzP_agILu8Oep2qP-SX-P8bznuwUhrF-LtA5QL-XvGYH9bwchMbEcnJFD1vW",
            // XCosSecurityToken:sign,
            // StartTime: data.startTime,
            // ExpiredTime: data.expiredTime,
            // expiration: data.expiration,
            // requestId: data.requestId,
            TmpSecretId: tmpSecretId,
            TmpSecretKey: tmpSecretKey,
            XCosSecurityToken: sign,
            // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
            StartTime: startTime, // 时间戳，单位秒，如：1580000000
            ExpiredTime: expiredTime, // 时间戳，单位秒，如：1580000900
            // ExpiredTime: 1646819905,
            ScopeLimit: true
          });
        },
        // 可选参数
        FileParallelLimit: 3000, // 控制文件上传并发数
        ChunkParallelLimit: 3000, // 控制单个文件下分片上传并发数
        ProgressInterval: 1000 // 控制上传的 onProgress 回调的间隔
      });

      let _this = this;
      cos.uploadFile(
        {
          Bucket: bucket,
          Region: region,
          Key: _this.uploadDate.objectKey,
          Body: file,
          // StorageClass: 'STANDARD',
          //  StorgeClass:'STANDARD'
          //      onProgress: function(progressData) {
          //     console.log(JSON.stringify(progressData));
          // }
          onProgress: function(progressData) {
            console.log(JSON.stringify(progressData));
          }
        },
        function(err, data) {
          console.log("Xxxxxxxxxxxxxxx");
          console.log(data || err);
          console.log("Xxxxxxxxxxxxxxx");
          if (data.statusCode == 200) {
            let path = "https://" + data.Location;
            // console.log("Xxxxxx======================xxxxxxxxx");
            // console.log(path);
            // _this.form.bookUrl = path;
            // _this.fileList =[path]
            // _this.getNumPages();
            _this.$emit("onSuccess", [path]);
            _this.$message({
              type: "success",
              message: "上传成功"
            });
            // console.log("Xxxxxx======================xxxxxxxxx");
          }else{
              _this.$message({
              type: "error",
              message: err
            });
          }
        }
      );
      // cos.uploadFile(
      //   {
      //     Bucket: bucket /* 填入您自己的存储桶，必须字段 */,
      //     Region: region /* 存储桶所在地域，例如ap-beijing，必须字段 */,
      //     Key:
      //       "202203091728316228733f36ed86eb4e0433a5" /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段 */,

      //     Body: file
      //   },
      //   function(err, data) {
      //     console.log(err || data);
      //     // if (data) {
      //     //   uploadId = data.UploadId;
      //     // }
      //   }
      // );
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file;
      this.dialogVisible = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.picture-upload-comp {
  .upload-bd {
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    position: relative;
  }
  .tips {
    height: 18px;
    margin-left: 10px;
    line-height: 1.2;
    color: #409eff;
    font-size: 18px;
    cursor: pointer;
  }
  /deep/.el-dialog__header {
    line-height: 0;
  }
  .el-upload-list {
    overflow: hidden;
    background-color: #fff;
    border: 1px solid #c0ccda;
    border-radius: 6px;
    box-sizing: border-box;
    width: 148px;
    height: 148px;
    margin: 0 8px 0 0;
    display: inline-block;
  }
  .el-upload-list__item-actions {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    cursor: default;
    text-align: center;
    color: #fff;
    opacity: 0;
    font-size: 20px;
    background-color: rgba(0, 0, 0, 0.5);
    transition: opacity 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .el-upload-list__item-actions:hover {
    opacity: 1;
  }
  .el-upload-list {
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
    font-size: 14px;
    color: #606266;
    line-height: 1.8;
    position: relative;
    img {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
  .upload-wrap {
    width: 148px;
    height: 148px;
    display: inline-block;
    overflow: hidden;
    margin: 0 8px 0 0;
  }
  .el-upload-list__item-preview,
  .el-upload-delete {
    margin: 0 10px;
    cursor: pointer;
  }
  &.id-photo {
    .el-upload-list {
      width: 180px;
      height: 114px;
      display: inline-block;
      overflow: hidden;
      margin: 0 8px 0 0;
    }
    .tips {
      position: absolute;
      bottom: 5px;
      left: auto;
      right: 0;
    }
  }
}
</style>
