<template>
  <div>
    <el-upload
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :before-remove="beforeRemove"
      :before-upload="beforeAvatarUpload"
      :limit="1"
      :on-exceed="handleExceed"
      :file-list="fileList"
      :http-request="uploadFile"
      :accept= "accept"
      action=""
      class="upload-demo">
      <el-button size="small" type="primary">点击上传</el-button>
      <div slot="tip" class="el-upload__tip">只能上传{{ seeTrans[uploadType] }}文件，且不超过16Mb</div>
    </el-upload>
  </div>
</template>
<script>
//    :on-success="handleAvatarSuccess"
// import { uploadImg, uploadMusic,uploadPdf,uploadDoc } from '@/api/upload.js'
import elDragDialog from '@/directive/el-dragDialog/index'
export default {
  directives: { elDragDialog },
  components: { imgShow },
  props: {
    fileList: {
      type: Array,
      default: () => []
    },
    uploadType: {
      type: String,
      default: () => 'images'
    }
  },
  data() {
    return {
      // uploadTypeTrans: {
      //   'photo': {
      //     urlPath: uploadImg,
      //     accept: 'image/jpeg,image/png,image/bmp'
      //   },
      //   'music': {
      //     urlPath: uploadMusic,
      //     accept: 'audio/mp3,video/mp4'
      //   },
      //   'doc': {
      //     urlPath: uploadDoc,
      //     accept: 'text/plain,application/msword,application/excel,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      //   },
      //   'pdf':{
      //     urlPath: uploadPdf,
      //     accept: 'application/pdf'
      //   }
      // },
      accept: 'image/jpeg,image/png,image/bmp',
      dialogVisible: false,
      seeTrans: { music: '歌曲', photo: '图片' },
      onClosed: () => {}
    }
  },
  mounted() {
    // if (this.uploadType && this.uploadTypeTrans[this.uploadType].accept) {
    //   this.accept = this.uploadTypeTrans[this.uploadType].accept
    // }
  },
  methods: {
    beforeAvatarUpload(file) {
      // 判断图片类型和大小
      const isLt16M = file.size / 1024 / 1024 < 16
 
      if (!isLt16M) {
        this.$message.warning('上传文件大小不能超过 16MB！')
      }
      return isLt16M
    },
 
    handleRemove(file, fileList) { // 删除图片
      console.log(file, fileList)
      this.fileList.map((v, index) => {
        if (v.name === file.name) {
          this.fileList.splice(index, 1)
          this.$emit('getFileList', this.fileList)
        }
      })
    },
 
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`, {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })
    },
 
    async uploadFile(file) {
      // try {
      //   console.log(file)
      //   const formData = new FormData()
      //   formData.append(this.uploadType, file.file)
      //   const res = await this.uploadTypeTrans[this.uploadType].urlPath(formData)
      //   if (res.error_code === 0) {
      //     res.data.map(v => {
      //       this.fileList.push({ name: file.file.name, url: v.file_url })
      //     })
      //     this.$emit('getFileList', this.fileList)
      //     this.$emit('fileSize', file.file.size)
      //     this.$message.success('上传成功')
      //   }
      //   console.log(this.fileList)
      // } catch (error) {
      //   this.fileList.pop()
      //   this.$message.warning(`上传文件错误: ${error.message}`)
      // } finally {
      //    // /// 写点啥呢？
      // }

      
    },
 
    handlePreview(file) { // 查看图片
      const data = {
        file: file,
        type: this.uploadType
      }
      this.$emit('showFile', data)
    },
 
    // handleAvatarSuccess(response, file) { // 上传图片回调
    //   // this.fileList.push(file)
    //   console.log(response)
    //   alert(1)
    // },
 
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    }
  }
}
</script>
 
