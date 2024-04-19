<template>
  <div v-dragging="isDrags" @mouseup="move" :style="'width:100px;line-height: 20px;position: absolute;z-index: 5; background: #f3f3f3;cursor:move'" class="pdfcop" ref="pdfcop">
    {{ explain }}
    <div style="position: absolute;top: 0px;right: 0px;z-index: 55;color: red;"><i class="el-icon-close" style="cursor:pointer" @click="remove"></i></div>
  </div>
</template>

<script>
export default {
  props: {
    explain: {},
    left: {
      default: 0
    },
    top: {
      default: 0
    }
  },
  // 拖拽指令
  directives: {
    dragging(el, binding, vnode) {
      const dragBox = el; // 获取当前元素
      // this获取不到，所以要通过传参的方式做出来，是这个指令自带的参数
      const _self = vnode.context;
      dragBox.style.left = _self.left + "px";
      dragBox.style.top = _self.top + "px";
      // 移动盒子
      dragBox.onmousedown = e => {
        e.preventDefault();
        // 算出鼠标相对元素的位置
        const disX = e.clientX - dragBox.offsetLeft;
        const disY = e.clientY - dragBox.offsetTop;
        document.onmousemove = e => {
          // 用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
          e.preventDefault();
          let left = e.clientX - disX;
          let top = e.clientY - disY;
          // 移动当前元素
          dragBox.style.left = left + "px";
          dragBox.style.top = top + "px";

          let x = (left / (476 - 100)).toFixed(2);
          let y = (top / (673.6 - 20)).toFixed(2);
          // 当x为0或者1都使它不能拖动
          if (left <= 0) {
            x = "0.00";
            // 使左边距离的边距为固定的，就不会拖动出去了
            dragBox.style.left = "0px";
          } else if (left >= 476 - 100) {
            x = "1.00";
            left = 476 - 100;
            dragBox.style.left = left + "px";
          }
          if (top <= 0) {
            y = "0.00";
            dragBox.style.top = "0px";
          } else if (top >= 673.6 - 20) {
            y = "1.00";
            top = 673.6 - 20;
            dragBox.style.top = top + "px";
          }
        };
        document.onmouseup = e => {
          e.preventDefault();
          // 鼠标弹起来的时候不再移动
          document.onmousemove = null;
          // 预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
          document.onmouseup = null;
        };
      };
    }
  },
  data() {
    return {
      isDrags: true
    };
  },
  methods: {
    remove() {
      this.$emit("remove");
    },
    move() {
      console.log(this.$refs.pdfcop.style.top.replace("px", "") - 0, this.$refs.pdfcop.style.left.replace("px", "") - 0);
      this.$emit("move", { x: this.$refs.pdfcop.style.left.replace("px", "") - 0, y: this.$refs.pdfcop.style.top.replace("px", "") - 0 });
    }
  }
};
</script>

<style></style>
