<template>
  <div class="containers" ref="content">
    <div class="canvas" ref="canvas"></div>
    <!-- panel为自定义属性面板，需要传入element，businessObject，moddle，modeling（后面会提及） -->
    <!-- <panel ref="panel" :element="element" :businessObject="businessObject" :moddle="moddle" :modeling="modeling"/> -->
  </div>
</template>
 
<script>
// 引入相关的依赖
import BpmnModeler from 'bpmn-js/lib/Modeler'
import activitiModdleDescriptor from './activiti.json'//要自定义的属性
import customTranslate from './customTranslate/customTranslate';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
// import panel from './panel'
export default {
  // components:{panel},
  data () {
    return {
      businessObject:null,
      element:null,
      moddle:null,
      modeling:null,
      // bpmn建模器
      bpmnModeler: null,
      container: null,
      canvas: null,
    }
  },
  methods: {
    createNewDiagram () {
      let _this = this
      const bpmnXmlStr = ``
      // 将字符串转换成图显示出来
      this.bpmnModeler.importXML(bpmnXmlStr, function (err) {
        if (err) {
          console.error(err)
        }
        _this.moddle = _this.bpmnModeler.get('moddle')
        _this.modeling = _this.bpmnModeler.get('modeling')
      })
    },
       exportDiagram(data) {
  
           let _this = this
      const bpmnXmlStr = `${data}`
      // 将字符串转换成图显示出来
      this.bpmnModeler.importXML(bpmnXmlStr, function (err) {
        if (err) {
          console.error(err)
        }
        _this.moddle = _this.bpmnModeler.get('moddle')
        _this.modeling = _this.bpmnModeler.get('modeling')
      })
    },
    dataOh(){
      // return console.log( this.businessObject)
      // return console.log( this.bpmnModeler)
      // thie.$emit()

      this.$emit("ensureab",this.businessObject, this.bpmnModeler)
    }
  },
  mounted () {
    // 获取到属性ref为“content”的dom节点
    let customTranslateModule = {
      translate: [ 'value', customTranslate ]
    }
    this.container = this.$refs.content
    // 获取到属性ref为“canvas”的dom节点
    const canvas = this.$refs.canvas
    
    
    // 建模，官方文档这里讲的很详细
    this.bpmnModeler = new BpmnModeler({
      container: canvas,
         additionalModules:[
        customTranslateModule
      ],
      moddleExtensions: {
        activiti: activitiModdleDescriptor
      },
    


    })
 
    // 下载画图
    let _this = this
    // 点击事件
    this.bpmnModeler.on('element.click',(event)=>{
      event.originalEvent.preventDefault();
      event.originalEvent.stopPropagation();
      _this.element = event.element
      _this.businessObject = getBusinessObject(_this.element);
      _this.$nextTick(()=>{
        _this.$refs.panel.init()
      })
    })
    this.createNewDiagram(this.bpmnModeler)
    
  },
}
</script>
 
<style lang="scss">
  /*左边工具栏以及编辑节点的样式*/
  @import 'bpmn-js/dist/assets/diagram-js.css';
  @import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
  @import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
  @import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
  .containers{
   /** position: absolute; */
    background-color: #ffffff;
    position: relative;
    width: 100%;
    height: 90%;
  }
  .canvas{
    width: 100%;
    height: 100%;
  }
  .panel{
    position: absolute;
    right: 0;
    top: 0;
    width: 260px;

  }
   // 隐藏没有用到的面板菜单
 // .group[data-group=tools],
 // .bpmn-icon-intermediate-event-none,
  .group[data-group=data-object],
  .group[data-group=data-store],
  .group[data-group=collaboration],
  .group[data-group=artifact],
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
  .bpmn-icon-gateway-none
  {
    display: none;
  }
  .djs-palette{
    width: 50px !important;

}
</style>