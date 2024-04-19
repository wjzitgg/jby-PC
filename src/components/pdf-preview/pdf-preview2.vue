<template>
  <div>
    <el-dialog  class="pdf-style-dialog" width="1300px" title="查看工程图纸" top="1vw" center :before-close="handleClose" :visible.sync="pdfShow" v-dialogDrag :close-on-click-modal="true" :close-on-press-escape="false"  @close="handleClose">
      <div class="max-box">
        <div class="list-left">
          <ul>
            <li v-for="(item, index) in drawList" :key="index" @click="lookOver(item)">
              <p>{{ item.drawingName }}</p>
              <img src="../../assets/dianjie.png" alt="" />
              <i class="el-icon-caret-right" v-if="urlr == item.drawingUrl"></i>
            </li>
          </ul>
        </div>
        <div class="pdf-view">
          <embed  :src="urlr"></embed>
        </div>
      
      </div>
    </el-dialog>
  </div>
</template>
<script>
import pdf from "vue-pdf-signature";
// 中文PDF加载空白引入依赖
import CMapReaderFactory from "vue-pdf/src/CMapReaderFactory.js";
export default {
  components: { pdf },
  props: {
    urlr: {
      type: String,
      default: ""
    },
    drawList: {
      type: Array,
      default: []
    },
    number: {
      //当前页
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      dragging: false,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
      itemBoteom: false,
      url: "",
      TransformScale: 1, //放大
      pageNum: 1,
      pageTotalNum: 1, // # 总页数
      loadedRatio: 0, //# 当前页面的加载进度，范围是0-1 ，等于1的时候代表当前页已经完全加载完成了
      numPages: 1,
      pdfSrc: "",
      pdfShow: false,
      width: "",
      height: "",
      num2: true
    };
  },
 
  methods: {
    lookOver(item) {
      console.log(item);
      if (this.urlr == item.drawingUrl) return;
      this.num2 = false;
      this.$emit("recordsChange", item.drawingUrl);
    }
   
  }
};
</script>
<style lang="scss" scoped>


.draggable {
  // position: absolute;
  cursor: move;
  transition: transform;
}
 /deep/ .el-dialog__header {
  text-align: left;
}
.max-box {
  display: flex;
  height: 800px;
  // width: 1400px;
  background-color: #fff;
  .list-left {
    margin-top: 40px;
    margin-right: 30px;
    cursor: pointer;
    ul {
      width: 300px;
      li {
        height: 80px;
        padding: 16px 20px;
        border: 1px solid rgba(238, 238, 238, 1);
        border-radius: 4px;
        margin-bottom: 10px;
        position: relative;
        p {
          color: rgba(32, 52, 87, 1);
          // white-space: nowrap;
          // overflow: hidden;
          // text-overflow: ellipsis;
          // display: -webkit-box;
          // -webkit-line-clamp: 2;
          // -webkit-box-orient: vertical;
        }
        img {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 70px;
          height: 40px;
        }
        .el-icon-caret-right {
          position: absolute;
          right: -20px;
          top: 35px;
        }
      }
    }
  }
  .pdf-view {
    flex: 1;
    height: 100%;
    embed{
      width: 100%;
      height: 100%;
    }
  }
}
</style>
