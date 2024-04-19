<template>
  <div class="single-image-upload-container">
    <div class="single-image-upload" :class="{'limit-num': fileList.length>=limit, 'mini': size === 'small'}">
      <el-upload ref="upload" :file-list="fileList" list-type="picture-card" action="#" :http-request="uploadToCos" :on-preview="handlePictureCardPreview" :on-remove="handleRemove" :on-exceed="exceedTips" :on-success="handeSuccess" :before-upload="beforeImageUpload" :on-change="onChangeHandle">
        <i class="el-icon-plus"></i>
        <p class="el-upload__tip" slot="tip" v-if="tips">{{tips}}</p>
        <div slot="file" slot-scope="{file}" class="img-con">
          <img class="el-upload-list__item-thumbnail" :src="file.url" alt="">
          <span class="el-upload-list__item-actions">
            <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
              <i class="el-icon-zoom-in"></i>
            </span>
            <span class="el-upload-list__item-delete" @click="handleRemove(file)">
              <i class="el-icon-delete"></i>
            </span>
            <span v-if="size === 'small'" style="display:block;marginLeft:0" class="el-upload-list__item-delete" @click="onChangeHandle(file)">
              <i class="el-icon-edit"></i>
            </span>
            <span v-else class="el-upload-list__item-delete" @click="onChangeHandle(file)">
              <i class="el-icon-edit"></i>
            </span>
          </span>
        </div>
      </el-upload>
    </div>
    <el-dialog :visible.sync="dialogVisibleShow">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
import { uploadObject } from './upload'
export default {
  // 上传图片到腾讯云对象存储
  name: 'ImgUpload',
  data () {
    return {
      imgWidth: 0,
      imgHeight: 0,
      picIndex: -1,
      dialogImageUrl: '',
      dialogVisibleShow: false,
      fileList: []
    }
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    tips: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium' // small
    },
    limit: {
      type: Number,
      default: 1
    },
    limitSize: {
      type: Number,
      default: 10
    },
    // 是否校验图片尺寸，默认不校验
    isCheckPicSize: {
      type: Boolean,
      default: false
    },
    checkWidth: {
      type: Number,
      default: 0 // 图片限制宽度
    },
    checkHeight: {
      type: Number,
      default: 0 // 图片限制高度
    },
    topLimitWidth: {
      type: Number,
      default: 0 // 图片限制宽度上限（有时需要校验上传图片宽度在一个范围内）
    },
    topLimitHeight: {
      type: Number,
      default: 0 // 图片限制高度上限（有时需要校验上传图片高度在一个范围内）
    },
    busiType: {
      type: Number,
      default: 2
    },
    index: {
      type: Number,
      default: -1 // 当前图片index，限制可以上传多张时，针对某一张进行操作，需要知道当前的index
    },
    limitType: {
      type: String,
      default: '' // gif,webp/gif/webp（限制上传格式）
    }
  },
  components: {},
  created () {
    if (this.value) {
      this.fileList = [{ url: this.value }]
    }
  },
  watch: {
    value (val) {
      if (val) {
        this.fileList = [{ url: val }]
      } else {
        this.fileList = []
      }
    }
  },
  methods: {
    onChangeHandle (file, fileList) {
      this.fileList = [file]
      // console.log('onChangeHandle file, fileList', file, fileList);
      this.$refs.upload.$refs['upload-inner'].handleClick()
    },
    handleRemove (file, fileList) {
      // console.log('handleRemove file, fileList', file, fileList);
      this.$emit('input', '')
      this.fileList = fileList
    },
    handlePictureCardPreview (file) {
      this.dialogImageUrl = file.url
      this.dialogVisibleShow = true
    },
    beforeImageUpload (file) {
      // console.log('beforeImageUpload', file);
      const imgType = file.type
      const isLtSize = file.size / 1024 / 1024 < this.limitSize
      const TYPE_NOGIFWEBP = ['image/png', 'image/jpeg', 'image/jpg']
      const TYPE_NOGIF = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      const TYPE_NOWEBP = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
      const TYPE_ALL = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
      let isType = true
      if (this.limitType && this.limitType.indexOf('gif') !== -1 && this.limitType.indexOf('webp') !== -1) {
        if (TYPE_NOGIFWEBP.indexOf(imgType) === -1) {
          isType = false
          this.$message.warning('仅支持上传 jpg、png、jpeg、gif、webp 格式的图片!')
        }
      } else if (this.limitType && this.limitType.indexOf('gif') === -1 && this.limitType.indexOf('webp') === -1) {
        if (TYPE_NOGIFWEBP.indexOf(imgType) === -1) {
          isType = false
          this.$message.warning('仅支持上传 jpg、png、jpeg 格式的图片!')
        }
      } else if (this.limitType && this.limitType.indexOf('webp') !== -1) {
        if (TYPE_NOGIF.indexOf(imgType) === -1) {
          isType = false
          this.$message.warning('仅支持上传 jpg、png、jpeg、webp 格式的图片!')
        }
      } else if (this.limitType && this.limitType.indexOf('gif') !== -1) {
        if (TYPE_NOWEBP.indexOf(imgType) === -1) {
          isType = false
          this.$message.warning('仅支持上传 jpg、png、jpeg、gif 格式的图片!')
        }
      } else {
        if (TYPE_ALL.indexOf(imgType) === -1) {
          isType = false
          this.$message.warning('仅支持上传 jpg、png、jpeg、webp、gif 格式的图片!')
        }
      }
     
      if (!isLtSize) {
        this.$message.warning(`上传图片大小不能超过${this.limitSize}MB!`)
      }
      if (this.isCheckPicSize === true) {
        const width = this.checkWidth
        const height = this.checkHeight
        const topWidth = this.topLimitWidth
        const topHeight = this.topLimitHeight
        const that = this
        const isSize = new Promise((resolve, reject) => {
          // console.log('Promise')
          // window对象，将blob或file读取成一个url
          const _URL = window.URL || window.webkitURL
          const img = new Image()
          img.onload = () => { // image对象的onload事件，当图片加载完成后执行的函数
            // console.log('img.onload')
            that.imgWidth = img.width
            that.imgHeight = img.height
            if (width && height) { // 校验图片的宽度和高度
              let valid = false
              if (topWidth && topHeight) {
                // 校验图片宽度和高度范围
                valid = ((width <= img.width) && (img.width <= topWidth)) && ((height <= img.height) && (img.height <= topHeight))
              } else if (topHeight) {
                // 校验图片高度范围
                valid = img.width === width && ((height <= img.height) && (img.height <= topHeight))
              } else if (topWidth) {
                // 校验图片宽度范围
                valid = ((width <= img.width) && (img.width <= topWidth)) && img.height === height
              } else {
                // 校验图片宽度、高度固定值
                valid = img.width === width && height === img.height
              }
              valid ? resolve() : reject(new Error('error'))
            } else if (width) { // 只校验图片的宽度
              let valid = false
              if (topWidth) {
                // 校验图片宽度范围
                valid = (width <= img.width) && (img.width <= topWidth)
              } else {
                // 校验图片宽度固定值
                valid = img.width === width
              }
              valid ? resolve() : reject(new Error('error'))
            } if (height) { // 只校验图片的高度
              let valid = false
              if (topHeight) {
                // 校验图片高度范围
                valid = (height <= img.height) && (img.height <= topHeight)
              } else {
                // 校验图片高度固定值
                valid = img.height === height
              }
              valid ? resolve() : reject(new Error('error'))
            }
          }
          img.src = _URL.createObjectURL(file)
        }).then(() => {
          // console.log('then')
          return file
        }, () => {
          // console.log('reject')
          let text = ''
          if (width && height) {
            if (topWidth && topHeight) {
              text = `图片尺寸限制为：宽度${width}~${topWidth}px，高度${height}~${topHeight}px！`
            } else if (topHeight) {
              text = `图片尺寸限制为：宽度${width}px，高度${height}~${topHeight}px！`
            } else if (topWidth) {
              text = `图片尺寸限制为：宽度${width}~${topWidth}px，高度${height}px！`
            } else {
              text = `图片尺寸限制为：宽度${width}px，高度${height}px！`
            }
          } else if (width) {
            if (topWidth) {
              text = `图片尺寸限制为：宽度${width}~${topWidth}px！`
            } else {
              text = `图片尺寸限制为：宽度${width}px！`
            }
          } else if (height) {
            if (topHeight) {
              text = `图片尺寸限制为：高度${height}~${topHeight}px！`
            } else {
              text = `图片尺寸限制为：高度${height}px！`
            }
          }
          this.$message.warning(text)
          return Promise.reject(new Error('error'))
        })
        return isType && isLtSize && isSize
      } else {
        // window对象，将blob或file读取成一个url
        const _URL = window.URL || window.webkitURL
        const img = new Image()
        img.onload = () => { // image对象的onload事件，当图片加载完成后执行的函数
          this.imgWidth = img.width
          this.imgHeight = img.height
        }
        img.src = _URL.createObjectURL(file)
        return isType && isLtSize
      }
    },
    // getUploadFileToken
    // 上传文件
    uploadToCos () {
      // console.log('uploadToCos uploadFile', this.fileList)
      let files = uploadObject(this.fileList[0].raw, (url) => {
        this.$emit('input', url)
      })
    },
    exceedTips (file, fileList) {
      this.$message(`最多上传${fileList.length}个文件！`)
    },
    handeSuccess (res, file, fileList) {
      console.log('handeSuccess')
    }
  }
}
</script>

<style lang='scss'>



</style>
