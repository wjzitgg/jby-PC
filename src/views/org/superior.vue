<!-- 劳务合同 -->
<template>
  <div class="app-container">
    <el-tabs v-model="orgType" @tab-click="orgTypeChange" v-if="user.orgType == 2">
      <el-tab-pane label="集团总公司" name="0"></el-tab-pane>
      <el-tab-pane label="监管单位" name="1"></el-tab-pane>
    </el-tabs>
    <div v-if="orgType == 0" class="box">
      <div class="box-item" v-for="item in tableData" :key="item.pkId">
        <el-avatar shape="square" :size="100" :src="item.orgLogo"></el-avatar>
        <div>{{ item.orgName }}</div>
        <div class="relieve" @click="relieveClick(item)">解除绑定</div>
      </div>
      <div class="add-btn box-item" @click="binding" v-if="tableData.length == 0">
        <div class="ico">+</div>
        <div>绑定集团公司</div>
      </div>
    </div>
    <div v-if="orgType == 1" class="box">
      <div class="box-item" v-for="item in tableData" :key="item.pkId">
        <el-avatar shape="square" :size="100" :src="item.orgLogo"></el-avatar>
        <div>{{ item.orgName }}</div>
        <div class="relieve" @click="relieveClick(item)">解除绑定</div>
      </div>
      <div class="add-btn box-item" @click="binding">
        <div class="ico">+</div>
        <div>绑定监管单位</div>
      </div>
    </div>

    <el-dialog :close-on-press-escape="false" title="绑定关联" top="15vw" :visible="linkDialog" @close="closeLinkDialog" width="21%" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <el-form label-width="100px" class="dialog-form">
        <el-form-item :label="orgType == 0 ? '绑定集团公司' : '绑定监管单位'">
          <el-autocomplete size="mini" class="inline-input" v-model="state" :fetch-suggestions="querySearch" placeholder="绑定公司管理员手机号码" :maxlength="11" :trigger-on-focus="false" @select="handleSelect" oninput="if(value.length>11)value=value.slice(0, 11)">
            <template slot-scope="{ item }">
              <a :title="item.orgName" style="text-decoration: none">{{ item.orgName }}</a>
            </template>
          </el-autocomplete>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="closeLinkDialog" size="mini">取消</el-button>
        <el-button type="primary" class="el-button-primary" :disabled="bindData.orgId == undefined || bindData.orgId == null || bindData.orgId.length == 0" @click="addBind" size="mini">保存</el-button>
      </div>
    </el-dialog>
    <!-- 解除绑定模态框 -->
    <el-dialog :close-on-press-escape="false" title="解除关联确认" top="15vw" :visible="relieveDialog" @close="closeRelieve" width="21%" v-loading="loading" v-dialogDrag :close-on-click-modal="false">
      <el-form label-width="90px" class="dialog-form">
        <el-form-item label="已绑定公司">
          <el-input disabled v-model="customOrgName"></el-input>
        </el-form-item>
        <div style="text-align: center; margin-bottom: 20px">
          <div>确定解除集团公司</div>
          <div>与本单位在系统中的绑定关系？</div>
        </div>
      </el-form>
      <div slot="footer">
        <el-button type="primary" class="el-button-primary" @click="notarize" size="mini">确认</el-button>
        <el-button @click="closeRelieve" size="mini">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import api from "@/api/api";
export default {
  data() {
    return {
      orgType: "0",
      linkDialog: false,
      state: "",
      squareUrl: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
      relieveDialog: false,
      customOrgName: "",
      tableData: [],
      loading: false,
      bindData: {
        orgId: ""
      },
      rowForm: {}
    };
  },
  mounted() {
    this.searchSuperiorOrg();
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user")) || [];
    }
  },
  methods: {
    orgTypeChange() {
      this.searchSuperiorOrg();
    },
    searchSuperiorOrg() {
      this.$api.searchSuperiorOrg({ superiorOrgType: this.orgType }).then(res => {
        if (res.code == 200) {
          this.tableData = res.data;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    relieveClick(row) {
      console.log("Xxxxxxxxxxx");
      console.log(row);
      console.log("Xxxxxxxxxxx");
      this.customOrgName = row.orgName;
      this.rowForm = row;
      this.relieveDialog = true;
    },
    closeRelieve() {
      this.relieveDialog = false;
    },
    notarize() {
      this.loading = true;
      // this.rowForm
      let data = { customId: "" };
      // if(this.orgType ==1){
      data.customId = this.rowForm.pkId;
      // }

      this.$api.secureBinding(data).then(res => {
        if (res.code == 200) {
          this.loading = false;
          this.closeRelieve();
          this.$message.success("解绑成功");
          this.searchSuperiorOrg();
        } else {
          this.loading = false;
          this.$message.error(res.msg);
        }
      });
    },
    addBind() {
      this.loading = true;
      this.$api.binding(this.bindData.orgId).then(res => {
        if (res.code == 200) {
          this.loading = false;
          this.bindData.orgId = "";
          this.closeLinkDialog();
          this.$message.success("绑定成功");
          this.searchSuperiorOrg();
        } else {
          this.loading = false;
          this.$message.error(res.msg);
        }
      });
    },
    closeLinkDialog() {
      this.linkDialog = false;
    },
    handleSelect(item) {
      console.log(item);
      this.bindData.orgId = item.pkId;
    },
    binding() {
      this.state = "";
      this.linkDialog = true;
    },
    //绑定链接模态框
    querySearch(queryString, cb) {
      if (/^1(3|4|5|6|7|8|9)\d{9}$/.test(queryString)) {
        let date = { linkPhone: queryString };
        // orgType
        // if (this.rowDate.relationStatus == 0 && this.rowDate.fkLinkOrgId - 0 !== 0) {
        //   date.linkOrgId = this.rowDate.fkLinkOrgId;
        // }
        if (this.user.orgType == 4) {
          date.orgType = 10;
        }
        if (this.user.orgType == 2 && this.orgType == 0) {
          date.orgType = 12;
        }
        if (this.user.orgType == 2 && this.orgType == 1) {
          date.orgType = 11;
        }
        debugger;
        api.searchSuperiorOrgByLinkPhone(date).then(res => {
          // 调用 callback 返回建议列表的数据,返回[]不显示选择框
          if (res.code === 200) {
            if (!res.data.length) {
              this.$message.warning("没有该电话号码对应的公司");
              cb([]);
            } else {
              let result = res.data.map(item => ({
                value: item.orgName,
                ...item
              }));
              cb(result);
            }
          } else {
            this.$message.warning(res.msg);
            cb([]);
          }
        });
      } else {
        cb([]);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.box {
  margin: 20px;
  display: flex;
  flex-wrap: wrap;
}
.box-item {
  margin-right: 8px;
  text-align: center;
  .relieve {
    text-align: right;
    font-size: 12px;
    color: #02a7f0;
  }
  .relieve:hover {
    cursor: pointer;
  }
}
.add-btn {
  width: 130px;
  height: 130px;
  border: 1px solid #d7d7d7;
  text-align: center;
  background: #f2f2f2;
  .ico {
    font-size: 68px;
  }
}
.add-btn:hover {
  cursor: pointer;
}
</style>
