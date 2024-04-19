<template>
  <div class="containers" ref="content">
    <div class="canvas" ref="canvas" id="canvas" @click="canvasClick"></div>
    <!-- panel为自定义属性面板，需要传入element，businessObject，moddle，modeling（后面会提及） -->
    <panel @getReply="getReply" ref="panel" :fkOrgId="fkOrgId" :orgType="orgType" :element="element"
      :businessObject="businessObject" :moddle="moddle" :forbidden="false" :modeling="modeling"
      :fkProfessionalTypeId="fkProfessionalTypeId" :fkEnginerringTypeId="fkEnginerringTypeId" :addTitle="addTitle"
      :workflowType="workflowType" :tableSource="tableSource" :warehouseType="warehouseType" :fkWorkflowId="fkWorkflowId"
      :bpmnContentStatus="bpmnContentStatus" :largeProcessPkId="largeProcessPkId" :subProcessPkId="subProcessPkId"  @pdfList="pdfList"  @launchInit="launchInit"/>
  </div>
</template>

<script>
// 引入相关的依赖
import BpmnModeler from "bpmn-js/lib/Modeler";
import activitiModdleDescriptor from "../activiti.json"; //要自定义的属性
import customTranslate from "../customTranslate/customTranslate";
import { getBusinessObject } from "bpmn-js/lib/util/ModelUtil";
// 自定义元素选中时的弹出菜单（修改 默认任务 为 用户任务）
import CustomContentPadProvider from "../content-pad";
//  additionalModel: [
//         CustomContentPadProvider,
//         CustomPaletteProvider,
//         // minimapModule,
//       ],
import panel from "./customPanel";
export default {
  name: "basic",
  components: { panel },
  props: {
    workflowType: "",
    fkOrgId: "",
    orgType: "",
    fkProfessionalTypeId: "",
    fkEnginerringTypeId: "",
    tableSource: "",
    warehouseType: "",
    addTitle: "",
    fkWorkflowId: "",
    bpmnContentStatus: {
      type: Boolean,
      default: false
    },
    largeProcessPkId: "",
    subProcessPkId: ""
  },
  data() {
    return {
      businessObject: null,
      element: null,
      moddle: null,
      modeling: null,
      // bpmn建模器
      bpmnModeler: null,
      container: null,
      canvas: null,
      // addTitle: null,
      tableIds: []
    };
  },
  methods: {
    launchInit(data){
      this.$emit('launchInit',data)
    },
    pdfList(data){
      this.$emit('pdfList',data)
    },
    getReply(param) {
      this.tableIds = param
    },
    canvasClick() {
      this.$nextTick(() => {
        this.$refs.panel.replacement();
      });
    },
    intCreateNewDiagram() {
      let _this = this;
      const bpmnXmlStr = `<?xml version="1.0" encoding="UTF-8"?>
        <bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" id="Definitions_0u4gsqp" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="6.1.1">
          <bpmn:process id="Process_1d6bkiu" isExecutable="false" />
          <bpmndi:BPMNDiagram id="BPMNDiagram_1">
            <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1d6bkiu" />
          </bpmndi:BPMNDiagram>
        </bpmn:definitions>`;
      // 将字符串转换成图显示出来
      this.bpmnModeler.importXML(bpmnXmlStr, function (err) {
        if (err) {
          console.error(err);
        }
        _this.moddle = _this.bpmnModeler.get("moddle");
        _this.modeling = _this.bpmnModeler.get("modeling");
      });
      // this.addTitle = "新增流程";

      this.$refs.panel.react();
    },
    exportDiagram(data, arr,row) {
      console.log("1111111111111111111111111")
      console.log(data)
      console.log(arr)
      console.log("1111111111111111111111111")
      // this.addTitle = item;
      let _this = this;
      const bpmnXmlStr = `${data}`;
      // 将字符串转换成图显示出来
      this.bpmnModeler.importXML(bpmnXmlStr, function (err) {
        if (err) {
          console.error(err);
        }
        _this.moddle = _this.bpmnModeler.get("moddle");
        _this.modeling = _this.bpmnModeler.get("modeling");
      });
      // _this.$nextTick(()=>{
      _this.$refs.panel.tableIdInit(arr,row);
      // })

    },
    dataOh() {
      const ElementRegistry = this.bpmnModeler.get("elementRegistry").getAll();
      if (this.tableIds.length == 1 && this.tableIds[0].tableId == '') {
        this.tableIds = []
      }
      if (this.tableIds.length != 0) {
        this.tableIds.forEach(item => {
          item.isArchives = item.isArchives == true ? 1 : 0;
        })
      }
      let obj =ElementRegistry[0]
      let arr = this.$refs.panel.nodeMarkArr
      if(ElementRegistry[0]){
        obj.businessObject.flowElements.forEach(item=>{
          arr.forEach(item2=>{
            if(item.id==item2.nodeMark){
              item.$attrs.tableIds = item2.tableIds;
            }
          })
        })
      }
      this.$emit("ensureab", obj, this.bpmnModeler, this.tableIds);
    },
    dataOhsa() {
      const ElementRegistry = this.bpmnModeler.get("elementRegistry").getAll();
      this.$emit("seedEnsureab", ElementRegistry[0], this.bpmnModeler, this.tableIds);
    },
    initBpmn() {
      console.log("2222222222");
      // 获取到属性ref为“content”的dom节点
      let customTranslateModule = {
        translate: ["value", customTranslate]
      };
      this.container = this.$refs.content;
      // 获取到属性ref为“canvas”的dom节点
      const canvas = this.$refs.canvas;

      // 建模，官方文档这里讲的很详细
      this.bpmnModeler = new BpmnModeler({
        container: canvas,
        additionalModules: [customTranslateModule, CustomContentPadProvider],
        // ,

        moddleExtensions: {
          activiti: activitiModdleDescriptor
        }
      });

      // 下载画图
      let _this = this;
      // 点击事件
      this.bpmnModeler.on("element.click", event => {
        if(event.element.type == "label" || event.element.type == "bpmn:SequenceFlow"){
          return
        }
        event.originalEvent.preventDefault();
        event.originalEvent.stopPropagation();
        _this.element = event.element;
        _this.businessObject = getBusinessObject(_this.element);
        // if (_this.businessObject.$attrs.fkRoleId != undefined) {
        //   _this.businessObject.fkRoleId = _this.businessObject.$attrs.fkRoleId;
        // }
        // if (_this.businessObject.$attrs.nodeApproveType != undefined) {
        //   _this.businessObject.nodeApproveType =
        //     _this.businessObject.$attrs.nodeApproveType;
        // }
        // if (_this.businessObject.$attrs.unitId != undefined) {
        //   _this.businessObject.unitId = _this.businessObject.$attrs.unitId;
        // }
        let iteArr = document.querySelectorAll(".djs-hit");
        let box = 0
        iteArr.forEach(item => {
          if (item.getBoundingClientRect().left > box) {
            box = item.getBoundingClientRect().left - 0
          }
        })
        let divBox = _this.$refs.canvas
        let max = box - divBox.getBoundingClientRect().left;
        let userTask = document.querySelectorAll(".djs-container");
        if (event.element.x == max) {
          userTask.forEach(item => {
            item.setAttribute("data-index", "");
          })
        } else {
          userTask.forEach(item => {
            item.setAttribute("data-index", "1");
          })
        }
        _this.$nextTick(() => {
          _this.$refs.panel.init();
        });
      });
      this.intCreateNewDiagram(this.bpmnModeler);
    }
  },
  mounted() {
    this.initBpmn();
  }
};
</script>

<style lang="scss">
/*左边工具栏以及编辑节点的样式*/
@import "bpmn-js/dist/assets/diagram-js.css";
@import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
@import "bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css";
@import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

.containers {
  /** position: absolute; */
  background-color: #ffffff;
  position: relative;
  width: 100%;
  height: 90%;
}

.canvas {
  width: 100%;
  height: 100%;
}

.panel {
  position: absolute;
  right: 0;
  top: 0;
  width: 260px;
}

// 隐藏没有用到的面板菜单
// .group[data-group=tools],
// .bpmn-icon-intermediate-event-none,
.group[data-group="data-object"],
.group[data-group="data-store"],
.group[data-group="collaboration"],
.group[data-group="artifact"],
.group[data-group="tools"],
.bpmn-icon-gateway-none,
.entry.bpmn-icon-loop-marker,
.djs-popup-body .bpmn-icon-task,
.bpmn-icon-send,
.bpmn-icon-receive,
.bpmn-icon-manual,
.bpmn-icon-business-rule,
.bpmn-icon-service,
.bpmn-icon-script,
.bpmn-icon-call-activity,
.bpmn-icon-subprocess-collapsed,
.bpmn-icon-subprocess-expanded,
.bpmn-icon-intermediate-event-none,
.bpmn-icon-gateway-none,
.bpmn-icon-task {
  display: none;
}

// /deep/ .bpmn-icon-gateway-none {
//   display: none !important;
// }
// .djs-palette {
//   width: 50px !important;
// }
// .djs-container[data-index="1"] .bpmn-icon-user-task,
// .djs-container[data-index="1"] .bpmn-icon-end-event-none {
//   display: none;
// }
// .djs-palette-entries .bpmn-icon-end-event-none {
//   display:""
// }
// .djs-context-pad .bpmn-icon-gateway-none,
// .djs-context-pad .bpmn-icon-intermediate-event-none,
// .djs-context-pad .bpmn-icon-connection-multi,
// .djs-context-pad .bpmn-icon-text-annotation,
// .djs-context-pad .bpmn-icon-screw-wrench {
//   display: none !important;
// }

// /deep/ .bpmn-icon-gateway-none {
//   display: none !important;
// }

// .wo-cao {
//   display: none !important;
// }

// .djs-container[data-index="1"] .bpmn-icon-user-task,
// .djs-container[data-index="1"] .bpmn-icon-end-event-none {
//   display: none;
// }
.djs-palette-entries .bpmn-icon-end-event-none {
  display: ""
}

.djs-palette {
  width: 50px !important;
}
.bpmn-icon-screw-wrench,
.bpmn-icon-connection-multi,
.bpmn-icon-text-annotation,
.bpmn-icon-intermediate-event-none,
.bpmn-icon-gateway-none{
  display: none !important;
}
/deep/ .bpmn-icon-screw-wrench,
/deep/ .bpmn-icon-connection-multi,
/deep/ .bpmn-icon-text-annotation,
/deep/ .bpmn-icon-intermediate-event-none,
/deep/ .bpmn-icon-gateway-none{
  display: none !important;
}
</style>
