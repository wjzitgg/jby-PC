<template>
  <div class="center">
    <div class="kaishi">
      <span>开始</span>
    </div>
    <img src="@/assets/jiantou.svg" class="jiantou" alt="" />
    <div v-for="(item, index) in pitchOnDate" :key="index">
      <div class="bpmShow">
        <div class="box" style="position: relative; display: flex; height: 200px; justify-content: center; align-items: center">
          <div class="kaishi" style="margin: 0"></div>

          <div v-for="(arrItm, i) in item.workflowNodes" v-show="arrItm.nodeType == 2" :key="i" style="width: 100px; height: 72px; border: 1px; border: 1px solid; margin: 0; margin-left: 30px; position: relative; border-radius: 5px; padding-top: 10px">
            <i class="el-icon-right" style="position: absolute; top: 18px; left: -30px; font-size: 30px"></i>
            <div><i class="el-icon-user-solid"></i>{{ arrItm.nodeName }}</div>
          </div>

          <div class="kaishi" style="display: inline-block; background-color: #ccc; margin: 0; margin-left: 30px; position: relative">
            <i class="el-icon-right" style="position: absolute; top: -5px; left: -30px; font-size: 30px"></i>
          </div>
        </div>
        <span class="bpmShowxshou">{{ item.workflowName }}</span>
        <!-- <div style="position: absolute; right: 8px; top: 8px; z-index: 1000">
          <el-button v-if="index != pitchOnDate.length - 1 && pitchOnDate[index + 1].workflowType != 13" class="bpmShowxshouButm" @click.stop="itemDown(pitchOnDate, index)" type="primary" icon="el-icon-bottom" size="mini" circle></el-button>
          <el-button class="bpmShowxshouButm" v-if="index != 0 && pitchOnDate[index].workflowType != 13" @click.stop="itemUpward(pitchOnDate, index)" type="primary" icon="el-icon-top" size="mini" circle></el-button>
        </div> -->
      </div>
      <img src="@/assets/jiantou.svg" class="jiantou" alt="" />
    </div>
    <div class="kaishi jieshu">
      <span>结束</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    list: []
  },
  data() {
    return {
      pitchOnDate: []
    };
  },
  watch: {
    list: {
      deep: true,
      handler() {
        let arr = [];
        if (this.launchType == 1) {
          this.searchAppointRole();
        }
        this.list.forEach(item => {
          if (item.nodeType == 3) {
            item.bookPdfs = item.bookPdfDTOS;
            item.workflowName = item.nodeName;
            item.workflowType = item.baseSubWorkflow.workflowType;
            item.pkId = item.fkWorkflowId;
            arr.push(item);
          }
        });
        arr.forEach(item => {
          item.workflowNodes = item.baseSubWorkflow.workflowNodeDTOS;
        });
        this.pitchOnDate = arr;
      }
    }
  },
  mounted() {}
};
</script>

<style lang="scss" scoped>
.center{
    overflow: auto;
    height: 500px;
    text-align: center;
    .kaishi {
      width: 25px;
      height: 25px;
      margin: 5px auto;
      border-radius: 50%;
      border: 1px solid;
      position: relative;
    
      span {
        position: absolute;
        left: -40px;
      }
    }
    
    .jieshu {
      background: #000;
    }
    
    .jiantou {
      transform: rotate(-91deg);
    }
    
    .bpmShow {
      width: 80%;
      height: 210px;
      border: 1px dashed;
      margin: 0 auto;
      margin-bottom: 8px;
      position: relative;
      overflow: hidden;
    
      .canvas {
        width: 100%;
      }
    
      /deep/ .djs-palette,
      /deep/.bjs-powered-by {
        display: none;
      }
    }
    
    .bpmShowxshou:hover {
      cursor: pointer;
    }
    
    .bpmShowxshou {
      position: absolute;
      top: 0;
      left: 0;
      padding: 8px;
      width: 100%;
      //   height: 100%;
      text-align: center;
    }
    
    .bpmShowxshouButm {
      z-index: 1000;
    }

}
</style>
