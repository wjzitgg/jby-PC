<template>
  <div class="panel-tab__content">
    <el-form size="mini" label-width="80px" @submit.native.prevent>
      <el-form-item label="技术规范">
        <el-col :span="8">
          <el-form-item prop="date1">
            <el-select
              v-model="businessKey"
              @change="updateElementBusinessKey"
              placeholder="请选择"
            >
              <el-option
                v-for="i in fieldList"
                :key="i.id"
                :value="i.id"
                :label="i.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="5">
          <el-input
            v-model="elementBaseInfo.sasr"
            clearable
            @change="updateBaseInfo('sasr')"
          />
        </el-col>
        <el-col :span="2">
          <span>页 -</span>
        </el-col>
        <el-col :span="5">
          <el-input
            v-model="elementBaseInfo.id"
            clearable
            @change="updateBaseInfo('id')"
          />
        </el-col>
        <el-col :span="1">
          <span>页</span>
        </el-col>
        <el-col :span="3">
          <el-button
            icon="el-icon-circle-plus-outline"
            plain
            style="border: none; color: #48a2ff; font-size: 17px"
          ></el-button>
        </el-col>
      </el-form-item>
      <el-form-item label="安全规范">
        <el-col :span="8">
          <el-form-item prop="date1">
            <el-select
              v-model="businessKey"
              @change="updateElementBusinessKey"
              placeholder="请选择"
            >
              <el-option
                v-for="i in fieldList"
                :key="i.id"
                :value="i.id"
                :label="i.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="5">
          <el-input
            v-model="elementBaseInfo.id"
            
            @change="updateBaseInfo('id')"
          />
        </el-col>
        <el-col :span="2">
          <span>页 -</span>
        </el-col>
        <el-col :span="5">
          <el-input
            v-model="elementBaseInfo.id"
            
            @change="updateBaseInfo('id')"
          />
        </el-col>
        <el-col :span="1">
          <span>页</span>
        </el-col>
        <el-col :span="3">
          <el-button
            icon="el-icon-circle-plus-outline"
            plain
            style="border: none; color: #48a2ff; font-size: 17px"
          ></el-button>
        </el-col>
      </el-form-item>
      <el-form-item label="验收标准">
        <el-col :span="8">
          <el-form-item prop="date1">
            <el-select
              v-model="businessKey"
              @change="updateElementBusinessKey"
              placeholder="请选择"
            >
              <el-option
                v-for="i in fieldList"
                :key="i.id"
                :value="i.id"
                :label="i.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col class="line" :span="5">
          <el-input
            v-model="elementBaseInfo.id"
            clearable
            @change="updateBaseInfo('id')"
          />
        </el-col>
        <el-col :span="2">
          <span>页 -</span>
        </el-col>
        <el-col :span="5">
          <el-input
            v-model="elementBaseInfo.id"
            clearable
            @change="updateBaseInfo('id')"
          />
        </el-col>
        <el-col :span="1">
          <span>页</span>
        </el-col>
        <el-col :span="3">
          <el-button
            icon="el-icon-circle-plus-outline"
            plain
            style="border: none; color: #48a2ff; font-size: 17px"
          ></el-button>
        </el-col>
      </el-form-item>
      <el-form-item label="关联表格">
        <el-col :span="21">
          <el-form-item prop="date1">
            <el-select filterable 
              v-model="businessKey"
              @change="updateElementBusinessKey"
              placeholder="请选择"
            >
              <el-option
                v-for="i in fieldList"
                :key="i.id"
                :value="i.id"
                :label="i.label"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-checkbox-group
        v-model="checkList"
        style="margin-top: 40px; margin-left: 20px"
      >
        <el-checkbox label="工程量"></el-checkbox>
        <el-checkbox label="材料用料"></el-checkbox>>
      </el-checkbox-group>
    </el-form>
  </div>
</template>
<script>
export default {
  name: "SignalAndMassage",
  data() {
    return {
      signalList: [],
      messageList: [],
      modelVisible: false,
      modelType: "",
      modelObjectForm: {},
      SignalAndMassage: {},
      fieldList: [],
      businessKey: "",
      elementBaseInfo: {},
      checkList: [],
    };
  },
  computed: {
    modelConfig() {
      if (this.modelType === "message") {
        return { title: "创建消息", idLabel: "消息ID", nameLabel: "消息名称" };
      } else {
        return { title: "创建信号", idLabel: "信号ID", nameLabel: "信号名称" };
      }
    },
  },
  mounted() {
    this.initDataList();
  },
  methods: {
    updateElementTask() {
      let taskAttr = Object.create(null);
      taskAttr.scriptFormat = this.scriptTaskForm.scriptFormat || null;
      taskAttr.resultVariable = this.scriptTaskForm.resultVariable || null;
      if (this.scriptTaskForm.scriptType === "inline") {
        taskAttr.script = this.scriptTaskForm.script || null;
        taskAttr.resource = null;
      } else {
        taskAttr.resource = this.scriptTaskForm.resource || null;
        taskAttr.script = null;
      }
      window.bpmnInstances.modeling.updateProperties(
        this.bpmnElement,
        taskAttr
      );
    },
    updateElementBusinessKey() {
      window.bpmnInstances.modeling.updateModdleProperties(
        this.bpmnElement,
        this.formData,
        {
          businessKey: this.businessKey,
        }
      );
    },
    updateBaseInfo(key) {
      console.log("111111111111")
      console.log(key)
         console.log("111111111111")
      if (key === "id") {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          id: this.elementBaseInfo[key],
          di: { id: `${this.elementBaseInfo[key]}_di` },
        });
        return;
      }
      if (key === "isExpanded") {
        window?.bpmnInstances?.modeling.toggleCollapse(this.bpmnElement);
        return;
      }
      const attrObj = Object.create(null);
      attrObj[key] = this.elementBaseInfo[key];
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, attrObj);
    },
    initDataList() {
      this.rootElements =
        window.bpmnInstances.modeler.getDefinitions().rootElements;
      this.messageIdMap = {};
      this.signalIdMap = {};
      this.messageList = [];
      this.signalList = [];
      this.rootElements.forEach((el) => {
        if (el.$type === "bpmn:Message") {
          this.messageIdMap[el.id] = true;
          this.messageList.push({ ...el });
        }
        if (el.$type === "bpmn:Signal") {
          this.signalIdMap[el.id] = true;
          this.signalList.push({ ...el });
        }
      });
    },
    openModel(type) {
      this.modelType = type;
      this.modelObjectForm = {};
      this.modelVisible = true;
    },
    addNewObject() {
      if (this.modelType === "message") {
        if (this.messageIdMap[this.modelObjectForm.id]) {
          return this.$message.warning("该消息已存在，请修改id后重新保存");
        }
        const messageRef = window.bpmnInstances.moddle.create(
          "bpmn:Message",
          this.modelObjectForm
        );
        this.rootElements.push(messageRef);
      } else {
        if (this.signalIdMap[this.modelObjectForm.id]) {
          return this.$message.warning("该信号已存在，请修改id后重新保存");
        }
        const signalRef = window.bpmnInstances.moddle.create(
          "bpmn:Signal",
          this.modelObjectForm
        );
        this.rootElements.push(signalRef);
      }
      this.modelVisible = false;
      this.initDataList();
    },
  },
};
</script>
