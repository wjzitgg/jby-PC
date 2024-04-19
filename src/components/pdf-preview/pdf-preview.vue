<template>
  <div>
    <!-- :style="{background:!itemBoteom?'white':'transparent'}" -->
    <el-dialog class="pdf-style-dialog" :before-close="handleClose" :visible.sync="pdfShow" :width="width" :height="height" v-dialogDrag :close-on-click-modal="true" :close-on-press-escape="false" :top="itemBoteom ? '1vw' : '0'">
      <div :style="{ background: !itemBoteom ? 'white' : 'transparent' }">
        <div class="dialog-form" :class="{ marginZero: itemBoteom }">
          <div class="pdf-header" :class="{ paddingZero: itemBoteom }"></div>

          <!--:style="{ transform: `translate(${x}px, ${y}px) scale(${transformScale})` }"  -->
          <div class="draggable" :class="{ 'pdf-box': !itemBoteom }" @mousedown="startDragging" @mousemove="updateDragging" @mouseup="stopDragging" :style="{ transform: `translate(${x}px, ${y}px) scale(${TransformScale})` }">
            <div class="magnify-width" @click="magnify" v-if="itemBoteom == false">
              <i class="el-icon-zoom-in" style="font-size: 14px; font-weight: 600;"> </i><br />
              <span>放大</span>
            </div>
            <div class="magnify-width" @click="(itemBoteom = false), (TransformScale = 1), (startX = 0), (startY = 0), (offsetX = 0), (offsetY = 0)" v-else>
              <i class="el-icon-zoom-out" style="font-size: 14px; font-weight: 600;"></i><br />
              <span>还原</span>
            </div>
            <div class="pdf-center" ref="pdfWrap" :class="{ pdfCenterMax: itemBoteom }">
              <pdf :page="pageNum" :src="url" @progress="loadedRatio = $event" @num-pages="pageTotalNum = $event"></pdf>
            </div>
          </div>
          <div class="pdf-button" :class="{ dsPdfButton: itemBoteom }">
            <el-button type="primary" icon="el-icon-arrow-left" size="mini" @click="prePage">上一页</el-button>
            <!-- {{ pageNum }} -->
            <div class="pdf-page">
              <div class="pageNum"><el-input size="mini" :value="pageNum" type="number" @input="pageNumCange" @focus="pageFocus($event)"></el-input></div>
              <div style="display:flex;align-items: center;">/{{ pageTotalNum }}</div>
            </div>
            <el-button type="primary" size="mini" @click="nextPage">下一页<i class="el-icon-arrow-right el-icon--right"></i></el-button>
          </div>
        </div>
      </div>
    </el-dialog>
    <div v-if="itemBoteom" class="bottomPosition">
      <i @click="addTransformScale()" class="el-icon-zoom-in"></i>
      <i @click="TransformScale -= 0.1" class="el-icon-zoom-out"></i>
      <!-- <i class="el-icon-full-screen"></i>
      <i class="el-icon-refresh-left"></i>
      <i class="el-icon-refresh-right"></i> -->
    </div>
    <!-- <div class="demo-image__preview">
      <el-image style="width: 100px; height: 100px" :src="url" :preview-src-list="srcList">
      </el-image>
    </div> -->
  </div>
</template>
<script>
import pdf from "vue-pdf-signature";
// 中文PDF加载空白引入依赖
import CMapReaderFactory from "vue-pdf-signature/src/CMapReaderFactory.js";
export default {
  components: { pdf },
  props: {
    urlr: {
      type: String,
      default: "http://image.cache.timepack.cn/nodejs.pdf"
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
      height: ""
    };
  },
  watch: {
    pdfShow(val) {
      if (!val) {
        this.url = "";
      } else {
        this.preview();
      }
    }
  },
  computed: {
    x() {
      return this.offsetX;
    },
    y() {
      return this.offsetY;
    }
  },
  methods: {
    startDragging(event) {
      this.dragging = true;
      this.startX = event.clientX;
      this.startY = event.clientY;
    },
    updateDragging(event) {
      if (this.dragging && this.itemBoteom) {
        const deltaX = event.clientX - this.startX;
        const deltaY = event.clientY - this.startY;
        this.offsetX += deltaX;
        this.offsetY += deltaY;
        this.startX = event.clientX;
        this.startY = event.clientY;
      }
    },
    stopDragging() {
      this.dragging = false;
    },
    handleClose(done) {
      if (!this.itemBoteom) {
        done();
      }
      this.TransformScale = 1;
      this.itemBoteom = false;
      (this.startX = 0), (this.startY = 0), (this.offsetX = 0), (this.offsetY = 0), console.log("this.itemBoteom -----> ", this.itemBoteom);
    },
    addTransformScale() {
      this.TransformScale += 0.1;
      console.log("222 -----> ", this.TransformScale);
    },
    magnify() {
      // this.width = "100%"
      // this.height = "100%"
      this.itemBoteom = true;
    },
    restore() {
      this.width = "";
      this.height = "";
      this.itemBoteom = true;
    },
    pageFocus(e) {
      e.currentTarget.select();
    },
    pageNumCange(e) {
      let max = this.pageTotalNum ? this.pageTotalNum : 1;
      this.pageNum = this.$limitInputNumber(Number(e), max, 1, 0) - 0;
    },
    //获取PDF总页数
    getNumPages() {
      let loadingTask = pdf.createLoadingTask(this.urlr);
      loadingTask.promise
        .then(pdf => {
          this.pageTotalNum = pdf.numPages;
        })
        .catch(err => {
          this.$message.warning("pdf 加载失败,请检查文件是否正常", err);
        });
    },
    preview() {
      this.getNumPages();
      this.pageNum = this.number;
      this.url = pdf.createLoadingTask({ url: this.urlr, CMapReaderFactory });
      console.log("this.url -----> ", this.url);
      this.pdfShow = true;
      this.$nextTick(() => {
        this.$refs.pdfWrap.scrollTo(0, 0);
      });
    },

    // 上一页
    prePage() {
      let page = this.pageNum;
      page = page > 1 ? page - 1 : this.pageTotalNum;
      if (page == this.pageTotalNum) {
        return;
      }
      this.pageNum = page;
      this.$refs.pdfWrap.scrollTo(0, 0);
    },
    // 下一页
    nextPage() {
      let page = this.pageNum;
      page = page < this.pageTotalNum ? page + 1 : 1;
      console;
      if (page == 1) {
        return;
      }
      this.pageNum = page;
      this.$refs.pdfWrap.scrollTo(0, 0);
      console.log("this.pageNum -----> ", this.url);
    }
  }
};
</script>
<style lang="scss" scoped>
.pdf-style-dialog {
  // padding: 15px !important;
  .pdf-header {
    padding: 10px;
  }

  .pdf-box {
    // height: 650px;
    // margin-top: 3px;
    // padding: 2px;
    background: url("../../assets/loading.gif") no-repeat center center;
    // box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(0, 0, 0, 0.3);
  }

  .pdf-center {
    max-height: 800px;
    overflow: auto;
  }

  .pdfCenterMax {
    max-height: initial;
    /* 或者 min-height: unset; */
    min-height: 800px;
  }

  .pdf-page {
    display: flex;
    font-size: 20px;
    margin: 0 10px;

    .pageNum {
      width: 70px;
    }
  }

  .pdf-button {
    display: flex;
    background-color: white;
    justify-content: center;
    // margin-top: 20px;
    padding: 20px;
    text-align: center;
  }

  .dsPdfButton {
    display: none;
  }

  /deep/ .el-dialog__header {
    display: none;
  }

  ::-webkit-scrollbar {
    width: 0px;
    color: #fff;
    background-color: #fcfcfc;
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgb(209, 209, 209);
  }
}

.magnify-width {
  position: absolute;
  right: 6px;
  color: #0030ff;
  font-weight: 800;
  z-index: 9999999;
  text-align: center;
  right: 36px;
  top: 28px;
  line-height: 1;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 5px;

  span {
    font-size: 12px;
  }
}

.magnify-width:hover {
  cursor: pointer;
}

.marginZero {
  margin: 0px;
}

.pdf-style-dialog {
  .paddingZero {
    padding: 0px;
  }
}

.bottomPosition {
  display: flex;
  position: fixed;
  left: 47%;
  color: white;
  font-size: 19px;
  z-index: 99999;
  border-radius: 38px;
  bottom: 34px;
  justify-content: space-around;
  align-items: center;
  width: 111px;
  height: 41px;
  background-color: #7c7575;
}

/deep/ .el-dialog {
  background-color: transparent;
  box-shadow: none !important;
}

.draggable {
  // position: absolute;
  cursor: move;
  transition: transform;
}
</style>
