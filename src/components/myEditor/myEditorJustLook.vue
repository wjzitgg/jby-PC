<template>
  <div style="border: 1px solid #ccc;" v-loading="loading">
    
    <!-- <Toolbar v-show="!proStatus" :defaultConfig="toolbarConfig" :editor="editor" :mode="mode"
      style="border-bottom: 1px solid #ccc" ref="toolbar" /> -->
    <Editor v-model="html" :defaultConfig="editorConfig" :mode="mode" class="editor" @onCreated="onCreated"
      ref="editor" />
  </div>
</template>

<script>
import Vue from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import COS from "cos-js-sdk-v5";

export default Vue.extend({
  components: { Editor, Toolbar },
  props: {
    // 用于回显的参数
    proHtml: {
      default: "",
      type: String
    },
    proStatus: {
      default: false,
      type: Boolean
    }
  },

  watch: {
    proHtml(val) {
      this.html = val;
    }
  },
  data() {
    return {
      editor: null,
      html: "<p></p>",
      toolbarConfig: {
        excludeKeys: [
          // 上传视频
          'group-video'
        ]
      },
      editorConfig: {
        placeholder: "请输入内容...",
        readOnly: true,
        MENU_CONF: {
          uploadImage: {
            customUpload: this.upLoad
            //    server: '*',
          }
        },

      },
      mode: "default", // or 'simple'
      loading: false
    };
  },
  methods: {
    onCreated(editor) {
      this.editor = Object.seal(editor); // 一定要用 Object.seal() ，否则会报错
    },
    // 上传
    upLoad(file, insertFn) {
      const typeName = file.name.substr(file.name.lastIndexOf(".")).toLowerCase();
      // return console.log(suffixname)
      const blobFile = this.$options.methods.dataURLtoBlob.bind(this)(file);
      const filename = file.name;
      let sign = "";
      let path = "";
      this.loading = true;
      this.$api
        .getUploadFileToken()
        .then(res => {
          if (res.code == 200) {
            sign = res.data.token;
            path = res.data.endpoint;
            this.uploadDate = res.data;
            this.$options.methods.upLoads.bind(this)(insertFn, sign, path, blobFile, filename, res.data.tmpSecretKey, res.data.tmpSecretId, res.data.startTime, res.data.expiredTime, typeName);
            // this.$message.success(res.msg);
          } else {
            this.$message.warning(res.msg);
            this.loading = false;
          }
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
        });
    },
    // 获取签名
    upLoads(insertFn, sign, folder, file, filename, tmpSecretKey, tmpSecretId, startTime, expiredTime, typeName) {
      const bucket = "epms-1307524156";
      const appid = "1256287502";
      const region = "ap-guangzhou";
      const cos = new COS({
        // 必选参数
        getAuthorization: function (options, callback) {
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
          onProgress: function (progressData) {
            // console.log(JSON.stringify(progressData));
          }
        },
        function (err, data) {
          if (data.statusCode == 200) {
            const path = "https://" + data.Location;
            insertFn(path, "", path);
            _this.loading = false;
            // _this.$message.success("上传成功");
          } else {
            _this.loading = false;
            _this.$message.error("上传失败");
          }
        }
      );
    },
    // DataURL转Blob
    dataURLtoBlob(fileObj) {
      return new Blob([fileObj], { type: fileObj.type });
    }
  },
  mounted() {
    // 模拟 ajax 请求，异步渲染编辑器
    this.loading = true
    setTimeout(() => {
      this.html = this.proHtml;
      this.loading = false
    }, 500);
  },
  beforeDestroy() {
    const editor = this.editor;
    if (editor == null) return;
    editor.destroy(); // 组件销毁时，及时销毁编辑器
  }

});
</script>
<!--引入css样式-->
<style src="@wangeditor/editor/dist/css/style.css"></style>
<!--根据项目UI需求配置自己的css-->
<style lang="scss" scoped>
.editor {
  height: 300px;

  #w-e-textarea-1 {
    text-align: left !important;
  }

  .w-e-text-container {
    text-align: left !important;
  }
}
</style>
