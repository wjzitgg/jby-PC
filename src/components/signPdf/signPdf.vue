<template>
  <div class="pdfH">
    <pdf v-for="item in pageTotalNum" :key="item" :page="item" :src="url"></pdf>
  </div>
</template>

<script>
import pdf from "vue-pdf-signature";
import CMapReaderFactory from "vue-pdf-signature/src/CMapReaderFactory.js";
export default {
  components: { pdf },
  props: {
    urlr: {
      type: String,
      default: "https://epms-1307524156.cos.ap-guangzhou.myqcloud.com/2023010419295963b56337848e915406b5dd1c.pdf"
    }
  },
  data(){
    return{
        pageTotalNum:1,
        url:"",
        loadedRatio: 0, //# 当前页面的加载进度，范围是0-1 ，等于1的时候代表当前页已经完全加载完成了
    }
  },
  mounted(){
    this.$nextTick(()=>{
      this.url = pdf.createLoadingTask({ url: this.urlr, CMapReaderFactory });
      this.getNumPages()
    })
  },
  methods: {
    //获取PDF总页数
    getNumPages() {
      let loadingTask = pdf.createLoadingTask(this.urlr);
      loadingTask.promise
        .then(pdf => {
          this.pageTotalNum = pdf.numPages;
          console.log(pdf.numPages);
        })
        .catch(err => {
          this.$message.warning("pdf 加载失败", err);
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.pdfH{
    height: 800px;
}
</style>