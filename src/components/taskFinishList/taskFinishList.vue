<template>
  <div class="box">
    <div class="begin">
      <div class="circle">
        <i class="el-icon-bottom el-icon-right-discolor"></i>
      </div>
      <div class="information" v-if="list.length">
        <div class="name">{{ list[0].assignee }}</div>
        <div class="time">{{ list[0].endTime }}</div>
        <div class="type">{{ list[0].comment }}</div>
      </div>
    </div>
    <div v-for="(item, index) in list" :key="index" style="position: relative">
      <div class="sub-process" v-if="item.currentNodeId != 0" :class="{'no-center': item.childList.length<7}">
        <div class="title">{{ item.processName }}</div>
        <div class="son-box" v-for="(e, idx) in item.childList" :key="idx">
          <div v-if="(show &&idx1!==1&& index == idx1 && idx3 > idx && idx2 < idx) || (idx1!==1&&show && e.approveStatus == '1')" class="left-line"></div>
          <div v-if="idx1!==1&&show && index == idx1 && idx2 <= idx && idx3 > idx" class="right-line"></div>
          <div v-if="idx1!==1&&(show && index == idx1 && e.approveStatus === 1) || (idx1!==1&&show && index == idx1 && idx2 == idx)" class="top-line"></div>
          <div class="jiantou el-icon-arrow-down" v-if="show &&idx1!==1&& index == idx1 && idx2 == idx"></div>
          <div class="role" :class="{ 'role-discolor': e.approveStatus == 2, hs: e.approveStatus == '0', red: e.approveStatus == '1' }">
            <!-- <i class="el-icon-user-solid"></i>
                        <span>{{ e.activityName }}</span>   -->
            <div v-if="e.activityName.length <= 5">
              <i class="el-icon-user-solid"></i> <span>{{ e.activityName }}</span>
            </div>
            <div v-else style="width: 124px" class="single-line" @mouseleave="mouseleave1(idx)" @mouseenter="mouseenter1(idx + e.activityName)">
              <i class="el-icon-user-solid"></i> <span>{{ e.activityName }}</span>
              <div class="yc" ref="yc" v-show="idx + e.activityName == showType">{{ e.activityName }}</div>
            </div>
            <i class="el-icon-right arrows-right" :class="{ 'el-icon-right-discolor': e.approveStatus == 2 ||currentNodeId=='0'||index<greenIdx1||(index==greenIdx1&&idx<greenIdx2)|| (e.approveStatus == '0' && item.childList[idx + 1].approveStatus == 2) }" v-if="item.childList.length != idx + 1"></i>
          </div>
          <div class="information" :class="{ skip: e.assignee == null, 'el-icon-right-discolor-red': e.approveStatus == 3 }">
            <div class="name">{{ e.assignee == null ? "跳过" : e.assignee }}</div>
            <div class="time">{{ e.endTime }}</div>
            <div class="type">{{ e.comment }}</div>
          </div>
        </div>
      </div>
      <i class="el-icon-bottom" v-if="item.currentNodeId != 0" :class="{ 'el-icon-right-discolor': item.approveStatus == 2||(index<greenIdx1)||currentNodeId=='0'}"></i>
      <div v-if="show&&index==1&&idx1==1" class="sub-process-left-line"></div>
      <div v-if="show&&index==1&&idx1==1" class="sub-process-top-line"></div>
      <div v-if="show&&index==1&&idx1==1" class="sub-process-right-line"></div>
      <div v-if="show&&index==1&&idx1==1" class="sub-process-right-jiantou el-icon-arrow-right"></div>
    </div>

    <div class="finish">
      <div class="circle"></div>
      <div class="information">结束</div>
    </div>
  </div>
</template>
  
<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    currentNodeId:"",
    list: {
      type: Array,
      default: [
        // { processName: null, activityName: null, assignee: "xm_29", comment: null, currentNodeId: "0", approveStatus: null, userId: null, endTime: "2023-06-20 17:22:02", childList: null },
        // {
        //     processName: null, activityName: null, assignee: null, comment: null, currentNodeId: "1529384469162450945", approveStatus: null, "userId": null, "endTime": null,
        //     childList: [
        //         { processName: null, activityName: "现场", assignee: "黄华海", comment: null, currentNodeId: "1529380661145440258", approveStatus: 0, userId: "1591002693288931330", endTime: null, childList: null },
        //         { processName: null, activityName: "桥梁", assignee: "嗡嗡嗡", comment: null, currentNodeId: "1529380661158023170", approveStatus: 0, userId: "1591985408658223105", endTime: null, childList: null },
        //         { processName: null, activityName: "施工", assignee: "黄华海", comment: null, currentNodeId: "1529380661170606081", approveStatus: 0, userId: "1591002693288931330", endTime: null, childList: null },
        //         { processName: null, activityName: "桥梁", assignee: "嗡嗡嗡", comment: null, currentNodeId: "1529380661178994690", approveStatus: 0, userId: "1591985408658223105", endTime: null, childList: null }]
        // }
      ]
    }
  },
  data() {
    return {
      // list: [
      //     { processName: "22212", activityName: null, assignee: "xm_29", comment: null, currentNodeId: "0", approveStatus: null, userId: null, endTime: "2023-06-20 17:22:02", childList: null },
      //     {
      //         processName: "小鹏垃圾", activityName: null, assignee: null, comment: null, currentNodeId: "1529384469162450945", approveStatus: null, "userId": null, "endTime": null,
      //         childList: [
      //             { processName: "shasha", activityName: "现场", assignee: "黄华海", comment: null, currentNodeId: "1529380661145440258", approveStatus: 1, userId: "1591002693288931330", endTime: "2023-06-20 17:22:02", childList: null },
      //             { processName: "shasha", activityName: "桥梁", assignee: "嗡嗡嗡", comment: null, currentNodeId: "1529380661158023170", approveStatus: 1, userId: "1591985408658223105", endTime: "2023-06-20 17:22:02", childList: null },
      //             { processName: "shasha", activityName: "施工", assignee: "黄华海", comment: null, currentNodeId: "1529380661170606081", approveStatus: 0, userId: "1591002693288931330", endTime: "2023-06-20 17:22:02", childList: null },
      //             { processName: "shasha", activityName: "桥梁", assignee: "嗡嗡嗡", comment: null, currentNodeId: "1529380661178994690", approveStatus: 0, userId: "1591985408658223105", endTime: "2023-06-20 17:22:02", childList: null }]
      //     },
      //     {
      //         processName: "小鹏垃圾1", activityName: null, assignee: null, comment: null, currentNodeId: "1529384469162450945", approveStatus: null, "userId": null, "endTime": null,
      //         childList: [
      //             { processName: "shasha", activityName: "现场", assignee: "黄华海", comment: null, currentNodeId: "1529380661145440258", approveStatus: 1, userId: "1591002693288931330", endTime: "2023-06-20 17:22:02", childList: null },
      //             { processName: "shasha", activityName: "桥梁", assignee: "嗡嗡嗡", comment: null, currentNodeId: "1529380661158023170", approveStatus: 0, userId: "1591985408658223105", endTime: "2023-06-20 17:22:02", childList: null },
      //             { processName: "shasha", activityName: "施工", assignee: "黄华海", comment: null, currentNodeId: "1529380661170606081", approveStatus: 0, userId: "1591002693288931330", endTime: "2023-06-20 17:22:02", childList: null },
      //             { processName: "shasha", activityName: "桥梁", assignee: "嗡嗡嗡", comment: null, currentNodeId: "1529380661178994690", approveStatus: 0, userId: "1591985408658223105", endTime: "2023-06-20 17:22:02", childList: null }]
      //     }
      // ]
      idx1: 0,
      idx2: 0,
      idx3: 0,
      showType: "",
      greenIdx1:0,
      greenIdx2:0,
    };
  },
  methods: {
    mouseleave1(idx) {
      this.$nextTick(()=>{
        this.showType = "";
      })
    },
    mouseenter1(vla) {
      this.showType = vla;
    }
  },
  mounted() {
    if (this.show) {
      this.list.forEach((item, index) => {
        item.childList &&
          item.childList.forEach((item2, index2) => {
            if (item2.approveStatus === 1) {
              this.idx1 = index;
              this.idx3 = index2;
              this.idx2 = item.childList.findIndex(value => {
                return value.assignee;
              });
              console.log(this.idx1, this.idx2, this.idx3);
            }
          });
      });
    }
      if(this.currentNodeId&&this.currentNodeId!=0){
         this.list.forEach((item, index) => {
          item.childList &&
            item.childList.forEach((item2, index2) => {
              if (item2.currentNodeId === this.currentNodeId) {
                this.greenIdx1 = index
                this.greenIdx2 = index2
                console.log(this.greenIdx1,this.greenIdx2);
              }
            });
        });
      }
  },
  watch: {
    list() {
      if (this.show) {
        this.list.forEach((item, index) => {
          item.childList &&
            item.childList.forEach((item2, index2) => {
              if (item2.approveStatus === 1) {
                this.idx1 = index;
                this.idx3 = index2;
                this.idx2 = item.childList.findIndex(value => {
                  return value.assignee;
                });
                console.log(this.idx1, this.idx2, this.idx3);
              }
            });
        });
      }
      if(this.currentNodeId&&this.currentNodeId!=0){
         this.list.forEach((item, index) => {
          item.childList &&
            item.childList.forEach((item2, index2) => {
              if (item2.currentNodeId === this.currentNodeId) {
                this.greenIdx1 = index
                this.greenIdx2 = index2
              }
            });
        });
      }
    },
    currentNodeId(){
      if(this.currentNodeId&&this.currentNodeId!=0){
         this.list.forEach((item, index) => {
          item.childList &&
            item.childList.forEach((item2, index2) => {
              if (item2.currentNodeId === this.currentNodeId) {
                this.greenIdx1 = index
                this.greenIdx2 = index2
              }
            });
        });
      }
    }
  }
};
</script>
  
<style lang="scss" scoped>
.box {
  .circle {
    position: relative;
  }

  .begin {
    display: flex;
    justify-content: center;

    .circle {
      margin-top: 14px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 1px solid;
      text-align: center;
      line-height: 50px;

      .el-icon-bottom {
        font-size: 30px;
        position: absolute;
        left: 20%;
        bottom: -32px;
      }
    }

    .information {
      padding: 8px;
      margin-left: 35px;
      width: 150px;
      text-align: center;
      border: 1px dashed #d7d7d7;
      font-size: 14px;
    }
  }

  .sub-process {
    position: relative;
    border: 1px dashed #d7d7d7;
    padding: 10px 20px;
    text-align: center;
    margin: 35px;
    // position: relative;
    display: flex;
   
    overflow-x: auto;
    // overflow-x: auto;
    .title {
      margin-left: 10px;
      text-align: left;
    }

    .son-box {
      position: relative;
      padding: 20px;
      // border: 1px solid;
      display: inline-block;
      margin-left: 25px;
      .left-line {
        position: absolute;
        width: 50%;
        height: 1px;
        top: 0;
        left: 0;
        background-color: #000;
      }
      .right-line {
        position: absolute;
        top: 0;
        right: -25px;
        width: calc(50% + 25px);
        height: 1px;
        background-color: #000;
      }
      .top-line {
        position: absolute;
        width: 1px;
        height: 20px;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        background-color: #000;
      }
      .jiantou {
        position: absolute;
        top: 10px;
        left: 50%;
        font-weight: 700;
        transform: translateX(-50%);
      }
      .role {
        padding: 6px 30px;
        border-radius: 12px;
        border: 1px solid;
        position: relative;

        .el-icon-right {
          position: absolute;
          right: -48px;
          top: 10%;
          font-size: 31px;
        }

        .el-icon-right-discolor {
          color: #dafba9;
        }
      }

      .role-discolor {
        background-color: #dafba9;
      }
      .hs {
        background: #f2f2f2;
      }
      .information {
        height: 80px;
        // line-height: 80px;
        padding: 3px 6px;
        margin-top: 10px;
        border: 1px dashed #d7d7d7;
        font-size: 14px;
        text-align: center;
      }
    }

  }
  .el-icon-bottom {
      font-size: 30px;
      position: absolute;
      left: 41.2%;
      bottom: -36px;
    }
   /* 定义滚动条样式，这里使用较细的滚动条 */
   .sub-process::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .sub-process::-webkit-scrollbar-thumb {
    background-color: #aaa;
  }

  .sub-process::-webkit-scrollbar-thumb:hover {
    background-color: #666;
  }
  .no-center{
    justify-content: center;
  }
  .finish {
    display: flex;

    // justify-content: center;
    .circle {
      margin-top: 14px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 1px solid;
      text-align: center;
      line-height: 50px;
      margin-left: 40.7%;
      background-color: #000000;
    }

    .information {
      margin-top: 25px;
      margin-left: 35px;
    }
  }

  .el-icon-right-discolor {
    color: #dafba9;
  }
  .el-icon-right-discolor-red {
    color: red;
  }
}
.skip {
  border: none !important;
  color: red;
  .name {
    line-height: 1;
  }
}
.red {
  background-color: red;
}
.single-line {
  width: 100px;
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 隐藏超出部分 */
  text-overflow: ellipsis; /* 显示省略号 */
}
.yc {
  position: absolute;
  // width: 300px;
  padding: 12px;
  border-radius: 5px;
  top: 33px;
  z-index: 99999999999999;
  color: #fff;
  background: #171414;
  //   display: none;
}
.sub-process-left-line{
  position: absolute;
  left: 5px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 1px;
  background-color: #000;
}
.sub-process-top-line{
  position: absolute;
  left: 5px;
  top: -57px;
  height: 150px;
  width: 1px;
  background-color: #000;
}
.sub-process-right-line{
  position: absolute;
  top: -57px;
  left: 5px;
  width: calc(50% - 140px);
  height: 1px;
  background-color: #000;
}
.sub-process-right-jiantou{
  position: absolute;
  top: -64px;
  left: calc(50% - 140px);
}
</style>
  