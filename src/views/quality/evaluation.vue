<template>
  <div class="app-container">
    <!-- 头部搜索框 -->
    <div slot="header" class="clearfix card-header search-bar-box">
      <div class="head">
        <el-form ref="form" label-width="80px">
          <!-- <el-form-item label="项目" v-if="user.orgType === 2 || user.orgType === 3 || user.orgType === 9">
            <el-select v-model="inpData.fkProjectId" size="mini" @change="proChange">
              <el-option v-for="item in options" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item label="标段项目" v-if="user.orgType !== 5">
            <proSelct @selectIds="selectIds"></proSelct>
          </el-form-item>
          <el-form-item label="检查状态" v-if="typeShow">
            <el-select v-model="inpData.completionStatus" size="mini">
              <el-option label="全部" value=""></el-option>
              <el-option label="未完成" :value="1"></el-option>
              <el-option label="已完成" :value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="检查结果"  v-if="typeShow">
            <el-select v-model="inpData.checkResult" size="mini">
              <el-option label="全部" value=""></el-option>
              <el-option :value="2" label="良好"></el-option>
              <el-option :value="1" label="合格"></el-option>
              <el-option :value="0" label="不合格"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="项目名称" label-width="80px"  v-if="typeShow">
            <el-input v-model="inpData.itemName" size="mini" class="wh-100" maxlength="50"></el-input>
          </el-form-item>
          <el-button  v-if="typeShow" type="primary" size="mini" class="btn-serach" @click="searchBtn" icon="el-icon-search">查询</el-button>
        </el-form>
      </div>
    </div>
    <!-- 表格       height="500"-->
    <div class="tab-container table-data" v-if="typeShow">
      <el-table  :tooltip-effect="'light'" :data="tableData" ref="tables" style="width: 100%" @expand-change="expandChange" :tree-props="{ children: 'children' }" row-key="pkId" v-loading="loading" height="100%" :header-cell-style="{ background: '#f1f6ff'}">
        <!-- <el-table-column label="序号" type="index" align="center" width="80"> </el-table-column> -->
        <el-table-column prop="itemCode" align="center"> 
          <template slot="header" slot-scope="scope">
               <i class="el-icon-s-operation" style="color:#1295d9;cursor: pointer;" @click="handleExpand('tables', 'isExpand', 'tableData')"></i>
               <span>编号</span>
             </template>
        </el-table-column>
        <el-table-column label="项目名称" prop="itemName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="施工工序流程" prop="workflowName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="完成状态" prop="completionStatus" width="300px" align="center">
          <template slot-scope="{ row }">
            <span v-if="row.completionStatus == 2">已完成</span>
            <span v-if="row.completionStatus == 1">未完成</span>
            <span v-else></span>
          </template>
        </el-table-column>
        <el-table-column label="评定结果" prop="checkResult" width="300px" align="center" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span v-if="row.checkResult === 0">不合格</span>
            <span v-if="row.checkResult === 1">合格</span>
            <span v-if="row.checkResult === 2">良好</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="420">
          <template slot-scope="{ row }">
            <!-- v-has="'org:jurisdiction:query'" -->
            <el-button size="mini" type="primary" plain v-has="'quality:evaluation:query'" @click="openCheckDialog(row, 1)" v-if="row.isQuery">查看评定表</el-button>
            <!-- v-has="'org:jurisdiction:framework'" -->
            <!-- <el-button size="mini" type="warning" plain v-has="'quality:evaluation:add'" @click="openCheckDialog(row, 2)" v-if="row.isAdd">新增评定表</el-button> -->
            <!-- v-has="'org:jurisdiction:project'" -->
            <!-- <el-button size="mini" type="success" plain v-has="'quality:evaluation:edit'" @click="openCheckDialog(row, 3)" v-if="row.isUpdate ">编辑评定表</el-button> -->
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
    <!-- 新增模态框 -->
    <el-dialog width="60%" top="5vw" center :close-on-press-escape="false" :title="nowObject.grade === 1 ? '单位工程质量检测评定表' : '分部工程质量检测评定表'" :visible.sync="checkDialog" v-loading="loading" @close="handleCancel" ref="checkModel" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form">
      <div class="htmlTable" v-if="(nowObject.grade < 3)">
        <h2 style="text-align:center">{{ nowObject.grade === 1 ? "单位工程质量检测评定表" : "分部工程质量检测评定表" }}</h2>
        <el-row :span="24" class="el-row-data">
          <el-col :span="9">
            <div class="items">
              <div class="label">分部工程名称：</div>
              <div class="value">{{ tableTopData.itemName }}</div>
            </div>
          </el-col>
          <el-col :span="15">
            <div class="items">
              <div class="label">{{ nowObject.grade === 1 ? "工程地点、桩号：" : "工程部位：(桩号、墩台号、孔号)：" }}</div>
              <div class="value">{{ "" }}</div>
            </div>
          </el-col>
          <el-col :span="24" v-if="nowObject.grade === 2">
            <div class="items">
              <div class="label">所属单位工程：</div>
              <div class="value">{{ tableTopData.itemParentName }}</div>
            </div>
          </el-col>
          <el-col :span="24">
            <div class="items">
              <div class="label">所属建设项目（合同段）：</div>
              <div class="value">{{ tableTopData.fkProjectName }}</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="items">
              <div class="label">施工单位：</div>
              <div class="value">{{ tableTopData.contractorName }}</div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="items">
              <div class="label">{{ nowObject.grade === 1 ? "单位工程编号：" : "分部工程编号：" }}</div>
              <div class="value">{{ tableTopData.itemCode }}</div>
            </div>
          </el-col>
        </el-row>
        <table style=" width: 100%; margin: 2px auto; border-collapse: collapse;table-layout:fixed;word-break:break-all;">
          <tr>
            <td colspan="3">分项工程</td>
            <td rowspan="2">备注</td>
          </tr>
          <tr>
            <td>分项工程编号</td>
            <td>分项工程名称</td>
            <td>质量等级</td>
          </tr>
          <tr v-for="(item, idx) in formData.childVos" :key="item.pkId">
            <td>{{ item.itemCode }}</td>
            <td>{{ item.itemName }}</td>
            <td :contenteditable="dialogType !== 1" v-html="item.qualityGrade" @blur="item.qualityGrade = $event.target.innerHTML" onkeypress="return (this.innerText.length < 100)" @input="inputChange($event, 100, 'qualityGrade' + idx)" :class="'qualityGrade' + idx">
              <!-- <input :disabled="dialogType === 1" type="text" v-model="item.qualityGrade" style="margin:0;padding:0;border: none; outline: none;width: 100%;height:100%" /> -->
            </td>
            <!--  -->
            <td :contenteditable="dialogType !== 1" v-html="item.remarks" @blur="item.remarks = $event.target.innerHTML" onkeypress="return (this.innerText.length < 200)" @input="inputChange($event, 200, 'remarks' + idx)" :class="'remarks' + idx">
              <!-- <input :disabled="dialogType === 1" type="text" v-model="item.remarks" style="margin:0;padding:0;border: none; outline: none;width: 100%;height:100%" /> -->
            </td>
          </tr>
          <tr>
            <td>外观质量</td>
            <td colspan="3"><input :maxlength="200" :disabled="dialogType === 1" v-model="formData.quality" type="text" style="margin:0;padding:0;border: none; outline: none;width: 100%;" /></td>
          </tr>
          <tr>
            <td>评定资料</td>
            <td colspan="3"><input :maxlength="200" :disabled="dialogType === 1" v-model="formData.evaluateContent" type="text" style="margin:0;padding:0;border: none; outline: none;width: 100%;" /></td>
          </tr>
          <tr>
            <td>质量等级</td>
            <td colspan="3"><input :maxlength="100" :disabled="dialogType === 1" v-model="formData.qualityGrade" type="text" style="margin:0;padding:0;border: none; outline: none;width: 100%;" /></td>
          </tr>
          <tr>
            <td>评定意见</td>
            <td colspan="3">
              <el-select size="mini" style="width:100%;border:0" :disabled="dialogType === 1" v-model="formData.opinion">
                <el-option value="1" label="优良"></el-option>
                <el-option value="2" label="合格"></el-option>
              </el-select>
            </td>
          </tr>
        </table>
      </div>
      <div class="htmlTable" ref="htmlTable" v-if="nowObject.grade === 3">
        <div v-for="item in tableList" :key="item.pkId">
        <table style="border-collapse: collapse;overflow: auto;margin: 0 auto;" ref="printPage">
          <tr v-for="(item, idx) in item.evaluateUrl" :key="idx" style="" v-show="item.status">
            <td style="box-sizing: content-box;border:none;margin:0;padding:0" :contentEditable="i.attributeTypes == 1 && i.disabled == true && i.checkout == false && dialogType !== 1" @blur="tdBlur(item, id, $event.target.innerText, $event)" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
              <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
              <el-input v-if="i.attributeTypes == 1 && i.checkout == 1" @input="tdNameChange(item, id, i.name)" @blur="tdNameBlur(item, id, i.name)" v-model="i.name" size="mini"></el-input>
              <span v-if="i.attributeTypes == 3">{{ i.signatureDate.content }}:</span>
              <el-select v-if="i.attributeTypes == 2" size="mini" v-model="i.name" placeholder="请选择">
                <el-option v-for="(e, index) in i.option" :key="index" :label="e.label" :value="e.label"></el-option>
              </el-select>
            </td>
          </tr>
        </table>
        </div>
        <div class="mask" v-show="dialogType === 1"></div>
      </div>
      <el-form :inline="true" label-width="auto" class="bottomform" v-if="(nowObject.grade < 3)">
        <el-form-item label="检测负责人">
          <el-input :disabled="dialogType === 1" size="mini" v-model="formData.person" maxlength="100"></el-input>
        </el-form-item>
        <el-form-item label="记录">
          <el-input :maxlength="1000" :disabled="dialogType === 1" size="mini" v-model="formData.record"></el-input>
        </el-form-item>
        <el-form-item label="复核">
          <el-input :maxlength="1000" :disabled="dialogType === 1" size="mini" v-model="formData.review"></el-input>
        </el-form-item>
        <div class="time">{{formData.year}}年{{formData.month}}月{{formData.day}}日</div>
      </el-form>
      </div>
      <div slot="footer" v-if="dialogType !== 1">
        <el-button type="primary" @click="btnOk">保存</el-button>
        <el-button type="primary" plain @click="handleCancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from "@/components/tablePaging";
export default {
  components: { Pagination },
  computed: {
    showList() {
      const { itemName, checkResult, completionStatus } = this.searchData;
      if (!itemName && checkResult === "" && !completionStatus) {
        return this.tableData;
      } else {
        if (checkResult === 0) {
          return this.tableData.filter(item => item.itemName.indexOf(itemName) !== -1 && String(item.completionStatus).indexOf(completionStatus) !== -1 && item.checkResult === checkResult);
        } else {
          const arr = this.tableData.filter(item => item.itemName.indexOf(itemName) !== -1 && String(item.checkResult).indexOf(checkResult) !== -1 && String(item.completionStatus).indexOf(completionStatus) !== -1);
          return arr;
        }
      }
    },
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  data() {
    return {
      proId: "",
      options: [],
      proOptions: [],
      // 表单数据
      tableData: [],
      // 查看模态框
      checkDialog: false,
      // 搜索条件
      inpData: {
        completionStatus: "",
        checkResult: "",
        itemName: "",
        fkProjectId: "",
        fkProjectBidId: ""
      },
      searchData: {
        fkProjectBidId: "",
        fkProjectId: "",
        completionStatus: "",
        checkResult: "",
        itemName: ""
      },
      loading: false,
      nowObject: {},
      tableList:[],
      formData: {
        evaluateContent: "",
        fkItemId: "",
        opinion: "",
        person: "",
        quality: "",
        childVos: [],
        qualityGrade: "",
        record: "",
        review: ""
      },
      tableTopData: {},
      dialogType: 1, // 1为查看，2为新增，3为编辑
      loading: false,
      isExpand:false,
      typeShow:true
    };
  },
  mounted() {
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2,3,4,9,10,11,12].includes(this.user.orgType)) {
          return this.typeShow = false;
        }
        if (this.user.orgType !== 5) {
      this.getAllProject();
    } else {
      this.inquireEvaluateAll();
    }
      } else {
        this.$message.error(res.msg);
      }
    });
  
  },
  methods: {
    selectIds(arr,obj,isTrue){
      console.log('获取到的',arr,obj);
      if(arr.length){
        if(arr.length>1){
          this.inpData.fkProjectId = arr[0]
          this.inpData.fkProjectBidId = arr[1]
        }else{
          this.inpData.fkProjectBidId = arr[0]
        }
        if(isTrue){
          this.searchBtn();
        }
      }
    },
    handleExpand(ref, isExpand, list) {
      this[isExpand] = !this[isExpand];
      this.$nextTick(() => {
        this.forArr(this[list], this[isExpand], ref);
      });
    },
    // 遍历
    forArr(arr, isExpand, ref) {
      
      arr.forEach(i => {
        if(!i.children){
          return
        }
        if(!i.children.length){
          return
        }
        // toggleRowExpansion(i, isExpand)用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中）
        this.$refs[ref].toggleRowExpansion(i, isExpand);
        if (i.children&&i.children.length) {
          this.forArr(i.children, isExpand, ref);
        }
      });
    },
    expandChange(row,expend){
      if(row.grade==1&&expend){
        this.forArr(row.children, true, "tables");
      }
    },
    tdBlur(item, id, val, e) {
      if (item.arr[id].checkout == true) {
        return;
      }
      item.arr[id].name = val;
      e.target.innerText = item.arr[id].name;
    },
    tdNameChange(item, id, val) {
      //  纯数字
      if (item.arr[id].checkType == 1) {
        val = val.replace(/[^0-9]/g, "");
        item.arr[id].name = val;
      }
      // 小数
      if (item.arr[id].checkType == 2) {
        val = val.replace(/[^\d.]/g, "");
        item.arr[id].name = val;
      }
      // 金额
      if (item.arr[id].checkType == 3) {
        val = val.replace(/[^\d.]/g, ""); // 清除“数字”和“.”以外的字符
        val = val.replace(/\.{2,}/g, "."); // 只保留第一个. 清除多余的
        val = val.replace(".", "$#$");
        val = val.replace(/\./g, "");
        val = val.replace("$#$", ".");
        val = val.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3"); // 只能输入两个小数
        item.arr[id].name = val;
      }
      // // 日期
      if (item.checkType == 4) {
        val = val.replace(/[^0-9-]/g, "");
        item.arr[id].name = val;
      }
      // 电话号码
      if (item.arr[id].checkType == 5) {
        val = val.replace(/[^0-9]/g, "");
        val = val.slice(0, 11);
        if (val.length >= 11) {
          const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
          if (!reg.test(val)) {
            this.$message.warning("请输入正确的手机号");
            item.arr[id].name = "";
          } else {
            item.arr[id].name = val;
          }
        }
      }
      // 身份证
      if (item.checkType == 6) {
        val = val.replace(/[\u4e00-\u9fa5/\s+/]|[^a-zA-Z0-9\u4E00-\u9FA5]/g, "");
        item.arr[id].name = val;
      }
    },
    tdNameBlur(item, id, val) {
      // 手机号
      if (item.arr[id].checkType == 5) {
        const mobile = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
        if (val.length != 0) {
          if (!mobile.test(val)) {
            this.$message.warning("请输入正确的手机号");
            item.arr[id].name = "";
          }
        }
      }

      // 日期
      if (item.arr[id].checkType == 4) {
        const data = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/;
        if (val.length != 0) {
          if (data.test(val)) {
          } else {
            item.arr[id].name = "";
            return this.$message.warning("请输入正确的时间格式xxxx-xx-xx");
          }
        }
      }
      // 身份证
      if (item.arr[id].checkType == 6) {
        const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
        // 15位身份证号码校验正则
        const regs = /^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$/;
        if (val.length != 0) {
          if (reg.test(val) || regs.test(val)) {
          } else {
            item.arr[id].name = "";
            return this.$message.warning("请输入正确的身份证号码");
          }
        }
      }
    },
    // 获取所有项目部
    getAllProject() {
      this.$api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          if ([2, 3, 9].includes(this.user.orgType)) {
            this.options = res.data.map(item => ({ ...item, label: item.projectName, value: item.pkId }));
            if (res.data.length) {
              this.inpData.fkProjectId = res.data[0].pkId;
              this.searchData.fkProjectId = res.data[0].pkId;
              this.allListBidByProId(0, res.data[0].pkId);
            }
          } else {
            if (res.data.length) {
              this.inpData.fkProjectBidId = res.data[0].pkId;
              this.searchData.fkProjectBidId = res.data[0].pkId;
              this.inquireEvaluateAll();
            }
            this.proOptions = res.data.map(item => ({ ...item, label: item.projectName, value: item.pkId }));
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取标段项目
    allListBidByProId(isWhole, projectId = "") {
      this.$api.allListBidByProId({ isWhole, projectId }).then(res => {
        if (res.code === 200) {
          this.proOptions = res.data.map(item => ({ ...item, value: item.fkBidProjectId, label: item.fkBidProjectName }));
          if (res.data.length) {
            this.inpData.fkProjectBidId = res.data[0].fkBidProjectId;
            this.searchData.fkProjectBidId = res.data[0].fkBidProjectId;
            this.inquireEvaluateAll();
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 选择项目部
    proChange(e) {
      this.inpData.fkProjectBidId = "";
      if (e) {
        this.allListBidByProId(0, e);
      }
    },
    // 打开查看模态框
    openCheckDialog(row, type) {
      this.dialogType = type;
      this.nowObject = row;
      if (row.grade < 3) {
        if (type === 1) {
          this.queryEvaluate(row.pkId);
        } else if (type === 2) {
          this.formData.fkItemId = row.pkId;
          this.selectByItemId(row.pkId);
        } else {
          this.queryEvaluate(row.pkId);
        }
      } else {
        // this.tableHtml = JSON.parse(row.evaluateUrl);let arr1 = JSON.stringify(this.tableDTOS);
        console.log(row);
        let arr=JSON.stringify(row.itemFinishRecordTableVos)
        this.tableList=JSON.parse(arr)
        this.tableList.forEach(item => {
          item.evaluateUrl = this.utils.unzip(item.evaluateUrl);
          if (item.evaluateUrl instanceof Array) {
          } else {
            item.evaluateUrl = JSON.parse(item.evaluateUrl);
          }
        });
        // this.tableHtml = JSON.parse(this.utils.unzip(row.evaluateUrl));
        this.checkDialog = true;
      }
      // api.getCustomInfoById({ pkId }).then((res) => {
      //   if (res.code === 200) {
      //     let { data } = res;
      //     this.checkModel = data;
      //     this.checkDialog = true;
      //   } else {
      //     this.$message.warning(res.msg);
      //   }
      // });
    },
    // 表格数据
    inquireEvaluateAll() {
      // fkProjectId: this.searchData.fkProjectId, fkProjectBidId: this.searchData.fkProjectBidId
      this.$api.inquireEvaluateAll({ ...this.searchData }).then(res => {
        if (res.code === 200) {
          this.tableData = res.data;
          this.$refs.tables.bodyWrapper.scrollTo(0, 0);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 新增前调的接口
    selectByItemId(itemId) {
      this.$api.selectByItemId({ itemId }).then(res => {
        console.log("新增前的接口", res);
        if (res.code === 200) {
          this.formData.childVos = res.data.childVos.map(item => ({ ...item, fkItemId: item.pkId, qualityGrade: "", remarks: "" }));
          this.formData.year = new Date().getFullYear()
          this.formData.month = new Date().getMonth() + 1
          this.formData.day = new Date().getDate()
          this.tableTopData = res.data;
          this.checkDialog = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 根据id查看详情
    queryEvaluate(itemId) {
      this.$api.queryEvaluate({ itemId }).then(res => {
        console.log("详情", res);
        if (res.code === 200) {
          this.formData = res.data;
          if(!this.formData.year){
            this.formData.year = new Date().getFullYear()
          }
          if(!this.formData.month){
            this.formData.month = new Date().getMonth() + 1
          }
          if(!this.formData.day){
            this.formData.day = new Date().getDate()
          }
          this.tableTopData = res.data;
          this.checkDialog = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    btnOk() {
      if (this.dialogType === 2) {
        this.loading = true;
        // 新增
        this.$api
          .addEvaluate(this.formData)
          .then(res => {
            if (res.code === 200) {
              this.inquireEvaluateAll();
              this.handleCancel();
              this.$message.success("新增成功");
            } else {
              this.$message.warning(res.msg);
            }
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
          });
      } else {
        // 编辑
        let data = {};
        if (this.nowObject.grade < 3) {
          data = { ...this.formData };
        } else {
          // const evaluateUrl = JSON.stringify(this.tableHtml);
          let arr=JSON.parse(JSON.stringify(this.tableList))
          arr.forEach(item => {
            item.evaluateUrl = JSON.stringify(item.evaluateUrl);
            item.evaluateUrl = this.utils.zip(JSON.stringify(item.evaluateUrl));
          });
        
          const itemFinishRecordTables = arr
          data = { fkItemId: this.nowObject.pkId, itemFinishRecordTables };
        }
        this.loading = true;
        this.$api
          .editEvaluate(data)
          .then(res => {
            if (res.code === 200) {
              this.inquireEvaluateAll();
              this.handleCancel();
              this.$message.success("编辑成功");
            } else {
              this.$message.warning(res.msg);
            }
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
          });
      }
    },
    // 关闭模态框
    handleCancel() {
      this.checkDialog = false;
      this.tableTopData = {};
      this.nowObject = {};
      this.formData = {
        evaluateContent: "",
        fkItemId: "",
        opinion: "",
        person: "",
        quality: "",
        childVos: [],
        qualityGrade: "",
        record: "",
        review: ""
      };
    },
    searchBtn() {
      this.searchData = { ...this.inpData };
      this.inquireEvaluateAll();
    },
    inputChange(e, max, dom) {
      if (e.target.innerHTML.length > max) {
        e.target.innerHTML = e.target.innerHTML.substring(0, max);
        const range = window.getSelection(); // 创建range
        range.selectAllChildren(document.querySelector(`.${dom}`)); // range 选择obj下所有子内容
        range.collapseToEnd(); // 光标移至最后
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.table-data{
  height: 88%;
}
.card-header {
  display: flex;
  align-items: center;
  background-color: $searcHeder;
  margin-bottom: 14px;
  .head {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 4px 0;
    .el-form {
      display: flex;
      align-items: center;
      .el-select,
      .el-input {
        width: 180px;
      }
      .el-form-item {
        margin-bottom: 0;
      }
    }
    .addBtn {
      margin-top: 5px;
      height: 28px;
    }
  }
}
.btn-serach {
  margin-left: 20px;
  height: 28px;
}
.htmlTable {
  position: relative;
  height: 550px;
  overflow: auto;
  tr {
    text-align: center;
    td {
      border: 1px solid #000;
      padding: 10px 0;
    }
  }
  .mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
  }
}
.bottomform {
  position: relative;
  .time {
    position: absolute;
    right: 10px;
    top: 10px;
  }
}
.items {
  display: flex;
  align-items: center;
  margin: 10px 0;
  .label {
    max-width: 250px;
  }
  .value {
    flex: 1;
  }
}
/deep/ .el-icon-arrow-right:before{
  content: "\e791";
  font-size: 16px;
  }
</style>
