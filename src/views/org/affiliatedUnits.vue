<template>
  <div class="app-container manage">
    <div class="people">
      <!-- <div @click="dianjiwa" class="dianjiwa">{{ company }}</div> -->
      <!-- 引入员工树形组建 -->
      <people :tree="dataStaff" :defaultProps="defaultProps" @peopleInfo="peopleInfo"></people>
    </div>
    <div class="sheet">
      <div class="search-bgc search-mr">
        <el-descriptions title="单位信息">
          <el-descriptions-item label="单位名称">{{nowClick.orgName}}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{nowClick.linkMan}}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{nowClick.linkPhone}}</el-descriptions-item>
          <!-- <el-descriptions-item label="单位地址">{{dataStaff[0].address == null?"":dataStaff[0].address }} </el-descriptions-item> -->
        </el-descriptions>
      </div>
      <div style="padding: 0 15px;font-weight: 700;">人员信息</div>
      <div class="table-data" style="height: 74%">
        <el-table :data="tableData" ref="tables" stripe v-loading="loading" height="98%" :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
          <el-table-column label="序号" width="60" align="center">
            <template slot-scope="scope">
              <div style="text-align: center">
                {{ (pageNum - 1) * pageSize + (scope.$index + 1) }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="aliasName" label="员工姓名" align="center"> </el-table-column>
          <el-table-column label="性别" width="60" align="center">
            <template slot-scope="{ row }">
              <span v-if="row.sex == 1">男</span>
              <span v-if="row.sex == 2">女</span>
            </template>
          </el-table-column>
          <el-table-column prop="telephone" label="手机号码" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="deptName" label="所属部门" align="center" show-overflow-tooltip> </el-table-column>
          <el-table-column prop="roleNameList" label="所属角色" align="center" show-overflow-tooltip> </el-table-column>
          <div slot="empty" class="empty" style="width: 100%">
            <img src="@/assets/empty.svg" class="zanwu" />
            <span>暂无数据</span>
          </div>
        </el-table>
      </div>
      <!-- 分页 -->
      <pageInation :currentPage="pageNum" :pageSize="pageSize" :total="total" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></pageInation>
    </div>
   
  </div>
</template>
  
  <script>
// 引入员工管理组建
import people from "@/components/staff/people";
import pageInation from "../../components/tablePaging";
import permIssion from "../../components/permission/permission";
// import dataPermisson from "./compoments/dataPermisson.vue";
// import Slider from "@/components/SlideVerify";
export default {
  name: "staff",
  data() {
    return {

      dataStaff: [],
      // 左边树形结构绑定数据字段
      defaultProps: {
        children: "childList",
        label: "orgName",
      },
      tableData: [], // 右侧表格数据
      loading: false,
      pageNum: 1,
      pageSize: 10,
      total: 0,
      company: "", // 公司
      companyId: "",
      orgId:"",
      nowClick:{}
    };
  },
  components: {
    people,
    pageInation,
    permIssion,
    // dataPermisson,
    // Slider
  },
  computed: {
    // 设置只有在项目部的时候才会显示这些
    // userNum() {
    //   let data = sessionStorage.getItem("user"); //
    //   data = JSON.parse(data);
    //   return data.fkOrgId; // 设置那个编辑里面的项目集合
    // },
    orgType() {
      let data = sessionStorage.getItem("user"); //
      data = JSON.parse(data);
      return data.orgType;
    }
  },
  
  mounted() {
    this.getChildOrg();
    // this.getData();
  },
  methods: {
    
    // 员工信息
    peopleInfo(data) {
      // 清空对象
      // Object.keys(this.form).forEach(key => {
      //   if (this.form[key] instanceof Array) {
      //     this.form[key] = [];
      //   } else {
      //     this.form[key] = "";
      //   }
      // });
      // console.log(data);
      // if (data.deptName != null) {
      //   this.form.userId = "";
      //   this.form.deptId = data.pkId;
      // } else {
      //   this.form.deptId = "";
      //   this.form.userId = data.pkId;
      // }
      console.log(data);
      if(data.last){
        this.nowClick = data
        this.orgId = data.pkId
        this.getData();
      }
    },
    dianjiwa() {
      this.form.userId = "";
      this.form.deptId = "";
      this.getData();
    },
    // 获取数据的方法
    getData() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        orgId: this.userNum
      };
      const obj = { ...params,orgId:this.orgId };
      this.loading = true;
      //    userName: "",
      // sex: "",
      // telephone: ""
      obj.userName = this.userName;
      obj.sex = this.sex;
      obj.telephone = this.telephone;
      this.$api
        .getUserList(obj)
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.total = res.data.total - 0;
            this.loading = false;
            this.$refs.tables.bodyWrapper.scrollTo(0, 0);
          } else {
            this.loading = false;
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 查询树形员工结构
    getChildOrg() {
      this.$api.getChildOrg().then(res => {
        if (res.code === 200) {
          // 树形员工集合
          res.data.childList=res.data.childList.map(item2=>({...item2,last:true}))
          this.dataStaff = [res.data];
          this.orgId=res.data.childList[0].pkId
           this.nowClick = res.data.childList[0]
          this.getData();
          // this.company = res.data.aliasName;
          // this.companyId = res.data.pkId;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
  


    // 选择每页多少条
    handleSizeChange(data) {
      this.pageSize = data;
      this.getData();
    },
    // 点击那一页
    handleCurrentChange(data) {
      Object.keys(this.form).forEach(key => {
        if (this.form[key] instanceof Array) {
          this.form[key] = [];
        } else {
          this.form[key] = "";
        }
      });
      this.pageNum = data;
      this.getData();
    },

  }
};
</script>
  
  <style lang="scss" scoped>
.wraper {
  border: 1px solid #333333;
  width: 100%;
  height: 100%;
}

.manage {
  height: 100%;
  display: flex;
}
.people {
  width: 15%;
  height: 99%;
  padding: 25px 0 25px 20px;
  // padding: 20px 60px 0 20px;
  // padding-left: 20px;
  // border: 1px solid #ebeef5;
  background-color: #fff;
  border-radius: 5px;
  font-size: 13px;
}
.sheet {
  flex: 1;
  margin-left: 10px;
  background-color: #fff;
  height: 96%;
  border-radius: 5px;
}

.form-flex {
  display: flex;
}


/deep/ .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
  border-color: #4080ff;
}
.dianjiwa {
  font-size: 14px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.dianjiwa:hover {
  cursor: pointer;
}
/deep/.el-table {
  height: 600px;
}
.wh-180 {
  width: 180px;
}
/deep/.el-select {
  .el-tag {
    max-width: 100px;
    overflow: hidden;
    white-space: nowrap; /*禁⽌换⾏*/
    text-overflow: ellipsis; /*省略号*/
  }
}


/deep/ .el-select__tags-text {
  max-width: 40px;
}


.permIssion-box {
  padding-left: 22px;
}

/deep/ .el-tabs__header {
  margin: 0 20px !important;
}
.search-bgc {
  margin-top: 23px;
}
.el-descriptions{
    padding: 0 15px;
}
</style>
  