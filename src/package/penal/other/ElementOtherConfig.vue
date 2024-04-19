<template>
  <div class="panel-tab__content">
    <div class="element-property input-property">
      <!-- <div class="element-property__label">元素文档：</div>
      <div class="element-property__value">
        <el-input
          type="textarea"
          v-model="documentation"
          size="mini"
          resize="vertical"
          :autosize="{ minRows: 2, maxRows: 4 }"
          @input="updateDocumentation"
          @blur="updateDocumentation"
        /> -->
      <!-- </div> -->
      <el-form size="mini" label-width="80px" @submit.native.prevent>
        <el-form-item label="技术规范">
          <!-- <el-col :span="8">
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
          </el-col> -->
          <el-col class="line" :span="5">
            <el-input
              v-model="elementBaseInfo.sasr"
              clearable
               @input="updateDocumentation"
          @blur="updateDocumentation"
            />
          </el-col>
          <el-col :span="2">
            <span>页 -</span>
          </el-col>
          <!-- <el-col :span="5">
            <el-input
              v-model="elementBaseInfo.id"
              clearable
              @change="updateBaseInfo('id')"
            />
          </el-col> -->
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
        <!-- <el-form-item label="安全规范">
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
        </el-form-item>
        <el-checkbox-group
          v-model="checkList"
          style="margin-top: 40px; margin-left: 20px"
        >
          <el-checkbox label="工程量"></el-checkbox>
          <el-checkbox label="材料用料"></el-checkbox>>
        </el-checkbox-group> -->
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "ElementOtherConfig",
  props: {
    id: String,
  },
  data() {
    return {
      documentation: "",
      elementBaseInfo:{
        sasr:""
      }
    };
  },
  watch: {
    id: {
      immediate: true,
      handler: function (id) {
        if (id && id.length) {
          this.$nextTick(() => {
            const documentations =
              window.bpmnInstances.bpmnElement.businessObject?.documentation;
            this.documentation =
              documentations && documentations.length
                ? documentations[0].text
                : "";
          });
        } else {
          this.documentation = "";
        }
      },
    },
  },
  methods: {
    updateDocumentation() {
      (this.bpmnElement && this.bpmnElement.id === this.id) ||
        (this.bpmnElement = window.bpmnInstances.elementRegistry.get(this.id));
      const documentation = window.bpmnInstances.bpmnFactory.create(
        "bpmn:Documentation",
        { text: this.documentation }
      );
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
        documentation: [documentation],
      });
    },
  },
  beforeDestroy() {
    this.bpmnElement = null;
  },
};
</script>
