<template>
  <div class="containers" ref="content">
    <div class="canvas" ref="canvasbpm"></div>
    <!-- panel为自定义属性面板，需要传入element，businessObject，moddle，modeling（后面会提及） -->
    <panel
      ref="panel"
      :element="element"
      :businessObject="businessObject"
      :moddle="moddle"
      :modeling="modeling"
      :forbidden="true" :flowTableArr="flowTableArr"
      :fkProfessionalTypeId="fkProfessionalTypeId" :fkEnginerringTypeId="fkEnginerringTypeId" :workflowType="workflowType" :fkOrgId="fkOrgId"
      :warehouseType="warehouseType" :fkWorkflowId="fkWorkflowId" :dataList="dataList"
    />
  </div>
</template>

<script>
// 引入相关的依赖
// import BpmnModeler from "bpmn-js/lib/Modeler";
import BpmnModeler from "bpmn-js/lib/Viewer";
import activitiModdleDescriptor from "../activiti.json"; //要自定义的属性
import customTranslate from "../customTranslate/customTranslate";
import { getBusinessObject } from "bpmn-js/lib/util/ModelUtil";
import panel from "./examinePanel";
export default {
  name: "examineBpmn",
  components: { panel },
  props: {
    XmlStr: {
      default: "",
      type: String
    },
    fkProfessionalTypeId:"",
    fkEnginerringTypeId:"",
    workflowType: "",
    flowTableArr:[],
    fkOrgId:"",
    warehouseType:"",
    fkWorkflowId:"",
    dataList:{}
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
      canvas: null
    };
  },
  methods: {
    createNewDiagram() {
      let _this = this;
      // const bpmnXmlStr = `<?xml version="1.0" encoding="UTF-8"?>
      //   <bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" id="Definitions_0u4gsqp" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="6.1.1">
      //     <bpmn:process id="Process_1d6bkiu" isExecutable="false" />
      //     <bpmndi:BPMNDiagram id="BPMNDiagram_1">
      //       <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1d6bkiu" />
      //     </bpmndi:BPMNDiagram>
      //   </bpmn:definitions>`;
      const bpmnXmlStr = `${_this.XmlStr}`;
      // 将字符串转换成图显示出来
      this.bpmnModeler.importXML(bpmnXmlStr, function(err) {
        if (err) {
          console.log(err);
        }
        _this.moddle = _this.bpmnModeler.get("moddle");
        // _this.modeling = _this.bpmnModeler.get("modeling");
        _this.bpmnModeler.get("canvas").zoom("fit-viewport", "auto");
      });
    },
    exportDiagram(data, item) {
      let _this = this;
      const bpmnXmlStr = `${data}`;
      // 将字符串转换成图显示出来
      this.bpmnModeler.importXML(bpmnXmlStr, function(err) {
        if (err) {
          console.error(err);
        }
        _this.moddle = _this.bpmnModeler.get("moddle");
        _this.bpmnModeler.get("canvas").zoom("fit-viewport", "auto");
        // _this.modeling = _this.bpmnModeler.get("modeling");
      });
      //  return console.log("1111111111111111111111")
      _this.$nextTick(()=>{
        _this.$refs.panel.tableIdInit(item);
      })
    
    },
    dataOh() {
      this.$emit("ensureab", this.businessObject, this.bpmnModeler);
    },
    initBpmn() {
      // 获取到属性ref为“content”的dom节点
      // let customTranslateModule = {
      //   translate: ["value", customTranslate]
      // };
      this.container = this.$refs.content;
      // 获取到属性ref为“canvas”的dom节点
      const canvas = this.$refs.canvasbpm;

      // 建模，官方文档这里讲的很详细
      this.bpmnModeler = new BpmnModeler({
        container: canvas,
        additionalModules: [
          {
            __init__: ["labelEditingProvider"],
            labelEditingProvider: ["value", null]
          }
        ]
        // moddleExtensions: {
        //   activiti: activitiModdleDescriptor
        // }
      });

      // 下载画图
      let _this = this;
      // 点击事件
      this.bpmnModeler.on("element.click", event => {
        event.originalEvent.preventDefault();
        event.originalEvent.stopPropagation();
        _this.element = event.element;
        _this.businessObject = getBusinessObject(_this.element);
        _this.$nextTick(() => {
          _this.$refs.panel.init();
        });
      });
      this.createNewDiagram(this.bpmnModeler);
    }
  },
  mounted() {
    this.initBpmn();
  }
};
</script>

<style lang="scss" scoped>
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
  width: calc(100% - 408px);
  height: 100%;
}
.panel {
  position: absolute;
  right: 0;
  top: 0;
  width: 260px;
}

.djs-context-pad {
  display: none !important;
}
</style>
