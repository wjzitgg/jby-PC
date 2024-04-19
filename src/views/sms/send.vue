<!-- 短信发送 -->
<template>
  <div class="app-container ">
    <div class="box" v-loading="loading">
      <el-form :model="form" ref="form" :rules="rules">
        <el-form-item label="短信签名" prop="signature" :label-width="formLabelWidth">
          <el-select v-model="form.signature" size="mini" @change="signatureChange">
            <el-option v-for="item in autoSignature" :key="item.pkId" :value="item.signName" :label="item.signName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="使用模板" prop="template" :label-width="formLabelWidth">
          <el-select v-model="form.template" size="mini" @change="templateNameChange">
            <el-option value="" label="-不使用模板-"></el-option>
            <el-option v-for="item in useTemplates" :key="item.pkId" :value="item.pkId" :label="item.templateName"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="接收对象" prop="remark" :label-width="formLabelWidth">
          <el-button type="primary" class="plus-btn" icon="el-icon-plus" @click="addition" size="mini"></el-button>
          <div class="personnel-box">
            <span class="personnel" v-for="(item, index) in smsRecordAdds" :key="index">{{ item.receivePhone }} {{ item.receiveName }}<i class="el-icon-close failure" @click="itemRemove(index)"></i></span>
          </div>
          <el-button type="primary" class="select-btn" size="mini" @click="choice">选择</el-button>
        </el-form-item>
        <div class="wd-500" style="text-align: right;">当前字数{{ form.templateContent.length }}/210字 记{{ Math.ceil(form.templateContent.length / 67) }}条短信</div>
        <el-form-item label="短信内容" prop="templateContent" :label-width="formLabelWidth">
          <el-input v-model="form.templateContent" class="w-200" :maxlength="210" type="textarea" style="resize: none" :rows="8" placeholder="请输入内容" autocomplete="off" :disabled="form.template != ''"></el-input>
        </el-form-item>
      </el-form>
      <div style="color: red;padding-left:100px;padding-bottom: 20px;font-size: 14px;">
        <p>注：</p>
        <p>1、{1}可自动替换为接收对象姓名</p>
        <p>2、根据短信运营商发送规则，短信每67个字符计一条短信</p>
        <div>3、不可发送以下内容：违法、反动、政治言论、黄赌毒、维权、恐吓、侵犯他人权益、还款提醒、催收、恶意短信等，不可发送营销类短信。</div>
      </div>
      <div class="send-btn">
        <el-button size="mini" v-has="'sms:send:radio'" class="el-button-primary" type="primary" @click="submit">发送</el-button>
      </div>
    </div>
    <el-dialog title="添加人员" :visible.sync="show1" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="dialog-footer">
        <el-table :data="tableData" height="300px" style="width: 100%">
          <el-table-column prop="date" align="center" label="姓名">
            <template slot-scope="{ row }">
              <el-input v-model="row.receiveName" autocomplete="off" maxlength="10"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="name" align="center" label="手机号码">
            <template slot-scope="{ row }">
              <el-input v-model="row.receivePhone" type="number" oninput="if(value.length>11)value=value.slice(0, 11)" maxlength="11" @keydown.native="keyDown" autocomplete="off"></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="address" align="center" label="操作" width="100">
            <template slot-scope="scope">
              <i class="el-icon-close failure" @click="remove(scope.$index)"></i>
              <i class="el-icon-plus succeed" v-if="scope.$index == tableData.length - 1" @click="addTo"></i>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" class="el-button-primary" @click="confirm">保 存</el-button>
      </div>
    </el-dialog>
    <el-dialog title="选择人员" :visible.sync="show2" width="500px" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false" v-loading="loading">
      <div class="hei-300 dialog-form">
        <el-tree :data="staffList" show-checkbox default-expand-all node-key="pkId" ref="tree" highlight-current :props="defaultProps"> </el-tree>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="abrogate">取 消</el-button>
        <el-button type="primary" class="el-button-primary" @click="ensure">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
    }
  },
  data() {
    return {
      loading: false,
      form: {
        signature: "",
        templateContent: "",
        template: ""
      },
      rules: {
        templateName: [
          {
            required: true,
            message: "模板名称不能为空",
            trigger: ["change", "blur"]
          }
        ]
      },
      formLabelWidth: "120px",
      autoSignature: [],
      useTemplates: [],
      smsRecordAdds: [],
      show1: false,
      tableData: [],
      templateContent: "",
      signature: "",
      show2: false,
      staffList: [],
      defaultProps: {
        children: "users",
        label: "userName"
      },
      flatData: []
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    ensure() {
      let arr2 = this.$refs.tree.getCheckedKeys();
      let arr1 = this.flatData;
      let arr = [];

      arr1.map(item => {
        arr2.map(item2 => {
          if (item.pkId == item2) {
            arr.push(item);
          }
        });
      });
      arr.forEach(item => {
        if (item.telephone) {
          this.smsRecordAdds.push({ receiveName: item.userName, receivePhone: item.telephone });
        }
      });
      this.smsRecordAdds = this.unique(this.smsRecordAdds);

      this.abrogate();
    },
    abrogate() {
      this.show2 = false;
      this.$refs.tree.setCheckedKeys([]);
    },
    choice() {
      this.show2 = true;
    },
    templateNameChange(val) {
      if (val.length) {
        this.useTemplates.forEach(item => {
          if (item.pkId == val) {
            this.form.templateContent = "【" + this.form.signature + "】" + item.templateContent;
          }
        });
      } else {
        this.form.templateContent = "";
      }
    },
    signatureChange(val) {
      this.form.templateContent = "";
      if (this.form.template.length) {
        this.useTemplates.forEach(item => {
          if (item.pkId == this.form.template) {
            this.form.templateContent = "【" + this.form.signature + "】" + item.templateContent;
          }
        });
      } else {
        let ind2 = this.form.templateContent.indexOf("]");
        let str = this.form.templateContent.substr(ind2 + 1, this.form.templateContent.length - 1);
        this.form.templateContent = "【" + this.form.signature + "】" + str;
      }
    },
    itemRemove(idx) {
      this.smsRecordAdds.splice(idx, 1);
    },
    addition() {
      this.show1 = true;
      if (this.smsRecordAdds.length == 0) {
        this.tableData = [{ receiveName: "", receivePhone: "" }];
      } else {
        let arr = JSON.stringify(this.smsRecordAdds);
        this.tableData = JSON.parse(arr);
      }
    },
    remove(idx) {
      this.tableData.splice(idx, 1);
    },
    addTo() {
      let idx = this.tableData.length == 0 ? 0 : this.tableData.length - 1;
      if (this.tableData[idx].receiveName == "" || this.tableData[idx].receivePhone == "") {
        return this.$message.warning("当前行数据未填写完时无法添加");
      } else {
        let myReg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        console.log("this.tableData[idx].receivePhone -----> ", this.tableData[idx].receivePhone);
        if (!myReg.test(this.tableData[idx].receivePhone)) {
          return this.$message.warning("请输入正确的手机号");
        }
      }
      this.tableData.push({ receiveName: "", receivePhone: "" });
    },
    confirm() {
      let idx = this.tableData.length == 0 ? 0 : this.tableData.length - 1;
      if (this.tableData[idx].receiveName == "" || this.tableData[idx].receivePhone == "") {
        return this.$message.warning("当前行数据未填写完时无法添加");
      } else {
        let myReg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!myReg.test(this.tableData[idx].receivePhone)) {
          return this.$message.warning("请输入正确的手机号");
        }
      }
      let bool = false;
      this.tableData.forEach(item => {
        let length = this.tableData.filter(item2 => item2.receivePhone == item.receivePhone).length;
        console.log(length);
        if (length > 1) {
          bool = true;
        }
      });
      if (bool) {
        return this.$message.warning("相同手机号只能添加一个");
      }
      let arr = JSON.stringify(this.tableData);
      this.smsRecordAdds = JSON.parse(arr);
      // this.tableData.forEach(item => {
      //   this.smsRecordAdds.push(item);
      // });
      // this.smsRecordAdds = this.unique(this.smsRecordAdds);
      console.log(this.smsRecordAdds);
      console.log(this.tableData);

      this.show1 = false;
    },
    cancel() {
      this.show1 = false;
      this.tableData = [];
    },
    submit() {
      if (this.smsRecordAdds.length == 0) {
        return this.$message.warning("请选择接收对象");
      }
      if (this.form.templateContent.indexOf(`【${this.form.signature}】`) === -1) {
        return this.$message.warning("不能手动删除【签名】信息");
      }
      let data = {
        smsContent: this.form.templateContent,
        smsRecordAdds: this.smsRecordAdds,
        isTemplate: this.form.template == "" ? 0 : 1,
        signName: this.form.signature,
        templateId: this.form.template
      };
      this.loading = true;
      this.$api.sysSmsAddBatch(data).then(res => {
        this.loading = false;
        if (res.code == 200) {
          this.smsRecordAdds = [];
          this.form = {
            signature: this.autoSignature[0].signName,
            templateContent: "【" + this.autoSignature[0].signName + "】",
            template: ""
          };
          this.$message.success(res.msg);
          // this.$router.go(0)
        } else {
          this.$message.warning(res.msg);
        }
      });
    },

    unique(arr) {
      const res = new Map();
      return arr.filter(arr => !res.has(arr.receivePhone) && res.set(arr.receivePhone, 1));
    },
    init() {
      this.smsSignSearchByOrgId();
      this.smsTemplateSearchByOrgId();
      this.searchDeptByOrgId();
    },
    // 短信签名
    smsSignSearchByOrgId() {
      this.$api.smsSignSearchByOrgId().then(res => {
        if (res.code == 200) {
          this.autoSignature = res.data;
          if (res.data.length) {
            this.form.signature = res.data[0].signName;
            this.form.templateContent = "【" + res.data[0].signName + "】";
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 使用模板
    smsTemplateSearchByOrgId() {
      this.$api.smsTemplateSearchByOrgId().then(res => {
        if (res.code == 200) {
          this.useTemplates = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    searchDeptByOrgId() {
      this.$api.searchDeptByOrgId().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.userName = item.deptName;
          });
          this.staffList = res.data;
          this.flatData = this.flat(res.data);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    flat(arr) {
      let result = [];

      arr.forEach(item => {
        result.push(item); // 将该节点压进去

        // 若该节点有子节点，则优先执行子节点
        if (Array.isArray(item.users) && item.users.length) {
          console.log(item);
          result = result.concat(this.flat(item.users));
        }
      });
      return result;
    },
    // 禁止输入事件
    keyDown(e) {
      const key = e.key;
      if (key === "e" || key === "-" || key === "." || key == "+") {
        e.returnValue = false;
        return false;
      }
      return true;
    }
  }
};
</script>

<style lang="scss" scoped>
// .app-container {
//     width: 800px;
// }
.box {
  // margin: 10px;
  height: 100%;
  padding-top: 20px;
  padding-bottom: 20px;
  background-color: #fff;
  border-radius: 5px;
}

.personnel-box {
  border: 1px solid #ccc;
  height: 120px;
  overflow: auto;

  .personnel {
    margin: 1px;
    display: inline-block;
    border: 1px solid #000;
  }
}

.select-btn {
  position: absolute;
  top: 30px;
  left: -65px;
}

.hei-300 {
  height: 300px;
  overflow: auto;
}

.plus-btn {
  position: absolute;
  right: 0;
  top: -32px;
}

.mb-10 {
  margin-bottom: 10px;
}

.mr-20 {
  margin-right: 20px;
}

.succeed {
  color: #67c23a;
}

.failure {
  color: #df0a0a;
}

.dialog-footer {
  text-align: center;
}

/deep/ .el-form-item__content {
  width: 500px;
}

.wd-500 {
  width: 620px;
}

.send-btn {
  width: 700px;
  text-align: center;
}
</style>
