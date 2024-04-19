<template>
  <div>
    <el-dialog title="上传头像" :visible="dialogVisible" width="800px" @close="closeDialog" :close-on-click-modal="false" class="footer-right" v-loading="loading">
      <div class="cropImg" v-if="dialogVisible">
        <VueCropper ref="cropper" :img="imgUrl" outputType="png" autoCrop fixed centerBox ></VueCropper>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button class="" type="primary" @click="uploadCropImg">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { VueCropper } from "vue-cropper";
import COS from "cos-js-sdk-v5";
export default {
  components: { VueCropper },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    imgUrl: ""
  },
  data() {
    return {
      // imgUrl:"",
      loading:false
    };
  },
  watch:{
    dialogVisible(val){
        if(val){
            this.$refs.cropper&&this.$refs.cropper.startCrop();
        }
    }
  },
  methods: {
    closeDialog() {
      this.$emit("update:dialogVisible", false);
    },
    uploadCropImg() {
      let that = this;
      this.$refs.cropper.getCropBlob(data => {
        // do something
        console.log(data);
        const blobFile = data;
        const filename = '头像' + Date.now();
        let sign = "";
        let path = "";
        that.loading = true;
        that.$api
          .getUploadFileToken()
          .then(res => {
            if (res.code == 200) {
              sign = res.data.token;
              path = res.data.endpoint;
              that.uploadDate = res.data;
              that.$options.methods.upLoads.bind(that)(sign, path, blobFile, filename, res.data.tmpSecretKey, res.data.tmpSecretId, res.data.startTime, res.data.expiredTime, '.png');
              // that.$message.success(res.msg);
            } else {
              that.$message.warning(res.msg);
              that.loading = false;
            }
          })
          .catch(err => {
            that.loading = false;
          });
      });
    },
    // 获取签名
    upLoads(sign, folder, file, filename, tmpSecretKey, tmpSecretId, startTime, expiredTime, typeName) {
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
          Key: _this.uploadDate.objectKey + typeName,
          Body: file,
          onProgress: function(progressData) {
            // console.log(JSON.stringify(progressData));
          }
        },
        function(err, data) {
          if (data.statusCode == 200) {
            const path = "https://" + data.Location;
            _this.$emit("getImgUrl",path)
            _this.loading = false;
            _this.closeDialog()
            _this.$message.success("上传成功");
          } else {
            _this.loading = false;
            _this.$message.error("上传失败");
          }
        }
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.cropImg {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 800px;
  height: 400px;
}
.footer-right {
  /deep/ .el-dialog__footer {
    text-align: right;
  }
  .dialog-footer {
    text-align: right;
    /deep/ .el-button--primary {
      width: 200px;
    }
  }
}
</style>
