<template>
  <div @mouseup="firstMove(1, $event)" style="position: absolute; text-align: center;background: #f3f3f3;width:80px;height:80px;cursor:move" class="signBox" v-drag="isDrag" ref="signBox">
    <div style="text-align: right;"><i class="el-icon-close" style="cursor:pointer" @click="firstRemo"></i></div>
    <div style="margin-top:35px">{{ content }}</div>
  </div>
</template>

<script>
export default {
  props: {
    top: {
      default: 0
    },
    left: {
      default: 0
    },
    content: {
      default: ""
    }
  },
  mounted() {
    if (!!this.top && !!this.left) {
      this.$refs.signBox.style.top = this.top + "px";
      this.$refs.signBox.style.left = this.left + "px";
    }
  },
  data() {
    return {
      editInfo: {
        coordinatesX: "",
        coordinatesY: ""
      },
      isDrag: true
    };
  },
  // 拖拽指令
  directives: {
    // 注册指令
    drag(el, binding, vnode) {
      const dragBox = el; // 获取当前元素
      // console.log("获取当前元素");
      // console.log("获取当前元素");
      // // if(this.signaturePosition.length){

      // }
      // dragBox.style.top = i * 90 + "px";
      // this获取不到，所以要通过传参的方式做出来，是这个指令自带的参数
      const _self = vnode.context;
      //   console.log(el, _self.editInfo);
      //   if (_self.editInfo.coordinatesX != "") {
      //     dragBox.style.left = parseInt(_self.editInfo.coordinatesX * (480 - 110)) + "px";
      //   }
      //   if (_self.editInfo.coordinatesY != "") {
      //     dragBox.style.top = parseInt(_self.editInfo.coordinatesY * (704 - 90)) + "px";
      //   }
      //   // 如果当前元素位置为空
      //   if (_self.editInfo.coordinatesX == "") {
      //     dragBox.style.left = "0px";
      //   }
      //   if (_self.editInfo.coordinatesY == "") {
      //     dragBox.style.top = "0px";
      //   }
      dragBox.style.left = "0px";
      dragBox.style.top = "0px";
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

          let x = (left / (476 - 110)).toFixed(2);
          let y = (top / (673.6 - 90)).toFixed(2);
          // 当x为0或者1都使它不能拖动
          if (left <= 0) {
            x = "0.00";
            // 使左边距离的边距为固定的，就不会拖动出去了
            dragBox.style.left = "0px";
          } else if (left >= 476 - 80) {
            x = "1.00";
            left = 476 - 80;
            dragBox.style.left = left + "px";
          }
          if (top <= 0) {
            y = "0.00";
            dragBox.style.top = "0px";
          } else if (top >= 673.6 - 80) {
            y = "1.00";
            top = 673.6 - 80;
            dragBox.style.top = top + "px";
          }

          _self.editInfo.coordinatesX = x;
          _self.editInfo.coordinatesY = y;
          // console.log(_self.editInfo.coordinatesX + "========x========");
          // console.log(_self.editInfo.coordinatesY + "========y========");
        };
        document.onmouseup = e => {
          e.preventDefault();
          // 鼠标弹起来的时候不再移动
          document.onmousemove = null;
          // 预防鼠标弹起来后还会循环（即预防鼠标放上去的时候还会移动）
          document.onmouseup = null;
        };
        return false;
      };
    }
  },
  methods: {
    firstMove(i, e) {
      console.log(this.$refs.signBox.style.top.replace("px", "") - 0, this.$refs.signBox.style.left.replace("px", "") - 0);
      this.$emit("getPosition", { x: this.$refs.signBox.style.left.replace("px", "") - 0, y: this.$refs.signBox.style.top.replace("px", "") - 0 });
    },
    firstRemo() {
      this.$emit("close");
    }
  }
};
</script>

<style></style>
