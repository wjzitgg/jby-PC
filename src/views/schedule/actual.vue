<template>
  <div class="app-container" v-loading="loading">
    <!-- 头部tab栏 -->
    <el-tabs v-model="topRadio" v-if="user.orgType === 5" @tab-click="changeTopRadio">
      <el-tab-pane label="分包单位" name="1"></el-tab-pane>
      <el-tab-pane label="工区" name="2"></el-tab-pane>
    </el-tabs>
    <!-- 头部搜索框 -->
    <SearchBar>
      <template slot="left">
        <el-form ref="form" label-width="80px" v-model="searchData">
          <el-form-item label="标段项目" v-if="![5,7].includes(user.orgType)">
            <treeSelect @selectIds="selectIds"></treeSelect>
          </el-form-item>
          <el-form-item label="标段项目" v-if="user.orgType == 7">
            <el-select size="mini" class="wh-200" v-model="fkProjectId">
              <el-option v-for="item in proOptions" :key="item.value" :value="item.value" :label="item.label"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="分包单位" v-if="user.orgType === 5 && topRadio == 1">
            <el-select size="mini" multiple collapse-tags class="wh-200" v-model="customerIds" @change="subChange">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in subOption" :key="item.fkCustomId" :value="item.fkCustomId" :label="item.customName"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="工区" v-if="user.orgType === 5 && topRadio == 2">
            <el-select size="mini" multiple collapse-tags class="wh-200" v-model="workAreaIds" @change="areaChange">
              <el-option value="" label="全部"></el-option>
              <el-option v-for="item in areaOption" :key="item.pkId" :value="item.pkId" :label="item.areaName"></el-option>
            </el-select>
          </el-form-item>

          <!-- <el-form-item label="完成状态">
            <el-select size="mini" class="wh-100" v-model="searchData.finishStatus">
              <el-option :value="0" label="全部"></el-option>
              <el-option :value="2" label="未完成"></el-option>
              <el-option :value="1" label="已完成"></el-option>
            </el-select>
          </el-form-item> -->
          <el-form-item label="截止日期" v-if="typeShow">
            <!-- <el-date-picker size="mini" value-format="yyyy-MM-dd" v-model="searchData.startTime"></el-date-picker>
            <span>起</span> -->
            <el-date-picker size="mini" value-format="yyyy-MM-dd" v-model="searchData.endTime"></el-date-picker>
          </el-form-item>
          <el-form-item v-if="typeShow">
            <el-radio-group v-model="radio">
              <el-radio :label="1">分项列表</el-radio>
              <el-radio :label="2">清单项目</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </template>
    </SearchBar>
    <!-- 表格 -->
    <div class="table-data" style="height: 80%; margin-top: 10px" v-if="typeShow">
      <el-table :tooltip-effect="'light'" height="90%" ref="tables1" stripe v-if="radio === 1" @expand-change="expandChange" :key="ranKey1" :data="tableData" :tree-props="{ children: 'children' }" row-key="pkId" :header-cell-style="{ background: '#f1f6ff' }">
        <!-- <el-table-column align="center" label="序号" type="index" width="80" /> -->
        <el-table-column align="center" prop="itemCode" show-overflow-tooltip>
          <template slot="header" slot-scope="{ row }">
            <i class="el-icon-s-operation" style="color: #1295d9; cursor: pointer" @click="handleExpand('tables1', 'isExpand', 'tableData')"></i>
            <span :cleanRed="row">项目编号</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="项目名称" prop="itemName" show-overflow-tooltip />
        <el-table-column align="center" :label="labelName" v-if="user.orgType === 5" :prop="topRadio == 1 ? 'customerName' : topRadio == 2 ? 'areaName' : 'orgName'" show-overflow-tooltip />
        <el-table-column align="center" label="单位" prop="unitName" show-overflow-tooltip />
        <el-table-column align="center" label="合同单价" prop="price" show-overflow-tooltip >
          <template slot-scope="{ row }">
          <span>{{ !pricePermission?'***':row.price }}</span>
        </template>
        </el-table-column>
        <el-table-column align="center" label="设计工程量" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span v-if="row.grade === 4">{{ row.designQuantities }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="合同金额" prop="designAmount" show-overflow-tooltip >
          <template slot-scope="{ row }">
                {{ !pricePermission ? "***" : row.designAmount }}
              </template>
        </el-table-column>
        <el-table-column align="center" label="完成工程量" prop="completeQuantities" show-overflow-tooltip />
        <!-- <el-table-column align="center" label="单价" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <span v-if="row.grade === 4">{{ !pricePermission?'***':row.price }}</span>
        </template>
      </el-table-column> -->
        <!-- <el-table-column align="center" label="设计产值" prop="designAmount" show-overflow-tooltip/> -->
        <el-table-column align="center" label="完成产值" prop="finishAmount" show-overflow-tooltip >
          <template slot-scope="{ row }">
          <span>{{ !pricePermission?'***':row.finishAmount }}</span>
        </template>
        </el-table-column>
        <el-table-column align="center" label="完成状态">
          <template slot-scope="{ row }">
            <span>{{ row.completionStatus === 1 ? "未完成" : row.completionStatus === 2 ? "已完成" : "" }}</span>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
      <el-select style="position: absolute; right: 44px; z-index: 999" v-if="radio == 2" size="mini"  class="wh-200" v-model="searchData.contractId">
        <!-- <el-option value="" label="全部"></el-option> -->
        <el-option v-for="item in contractData" :key="item.pkId" :value="item.pkId" :label="item.contractName"></el-option>
      </el-select>
      <el-tabs v-model="detailRadio" v-if="radio == 2 && tableData.length" style="height: 100%">
        <el-tab-pane :label="item.itemName" :name="index + ''" v-for="(item, index) in tableData" :key="index" style="height: 100%">
          <el-table :tooltip-effect="'light'" height="85%" stripe ref="tables2" :data="item.children" :key="ranKey2" :summary-method="getSummaries" show-summary :header-cell-style="{ background: '#f1f6ff' }">
            <el-table-column align="center" label="子目号" prop="itemCode" />
            <el-table-column align="center" label="清单名称" prop="itemName" />
            <el-table-column align="center" v-if="topRadio == 1" label="分包单位" prop="customerName" show-overflow-tooltip />
            <el-table-column align="center" v-if="topRadio == 2" label="工区" prop="areaName" show-overflow-tooltip />
            <el-table-column align="center" label="单位" prop="unitName" show-overflow-tooltip />
            <el-table-column align="center" label="合同工程量" prop="designQuantities" show-overflow-tooltip />
            <el-table-column align="center" label="合同单价" prop="price" show-overflow-tooltip>
              <template slot-scope="{ row }">
                {{ !pricePermission ? "***" : row.price }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="合同金额" prop="designAmount" show-overflow-tooltip>
              <template slot-scope="{ row }">
                {{ !pricePermission ? "***" : row.designAmount }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="完成工程量" prop="completeQuantities" show-overflow-tooltip />
            <!-- <el-table-column align="center" label="单价" prop="price" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ !pricePermission?'***':row.price }}
          </template>
        </el-table-column> -->
            <!-- <el-table-column align="center" label="设计产值" prop="designAmount" show-overflow-tooltip/> -->
            <!-- <el-table-column align="center" label="完成工程量" prop="completeQuantities" show-overflow-tooltip>
          <template slot-scope="{row}">
            {{ !pricePermission?'***':row.completeQuantities }}
          </template>
        </el-table-column> -->
            <el-table-column align="center" label="完成产值" prop="finishAmount" show-overflow-tooltip>
              <template slot-scope="{ row }">
                {{ !pricePermission ? "***" : row.finishAmount }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="完成百分比" show-overflow-tooltip>
              <template slot-scope="{ row }">
                <span>
                  {{ row.designAmount > 0 ? (((row.finishAmount - 0) / (row.designAmount - 0)) * 100).toFixed(2) + "%" : "" }}
                </span>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <div class="empty" style="width: 100%; height: 80%" v-if="radio == 2 && !tableData.length">
        <img src="@/assets/empty.svg" class="zanwu" />
        <span>暂无数据</span>
      </div>
    </div>
    <div class="empty" style="width: 100%; height:80%" v-if="user.orgType != 5 && !typeShow">
      <img src="@/assets/empty.svg" class="zanwu" />
      <span>暂无数据</span>
    </div>
  </div>
</template>

<script>
import SearchBar from "./components/SearchBar.vue";
import api from "@/api/api";
import Template from "../sms/template.vue";
import treeSelect from '../../components/proTreeSelect/treeSelect.vue';
export default {
  components: { SearchBar, Template,treeSelect },
  data() {
    return {
      tableData: [],
      radio: 1,
      topRadio: "3",
      searchData: {
        isItemDetail: 0,
        isForm: 0,
        isWhole: 1,
        startTime: "",
        endTime: "",
        contractId: ""
        // finishStatus:0
      },
      finished: "",
      options: [],
      proOptions: [],
      areaOption: [],
      subOption: [],
      fkProjectId: "",
      workAreaIds: [""],
      customerIds: [""],
      loading: false,
      proId: "",
      ranKey1: Math.random(),
      ranKey2: Math.random(),
      isExpand: false,
      detailRadio: "",
      contractData: [],
      typeShow:true
    };
  },
  mounted() {
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          return (this.typeShow = false);
        }
      } else {
        this.$message.error(res.msg);
      }
    });
    if (this.user.orgType !== 5) {
      // this.getAllProject();
      // this.getActualFinishList();
      if(this.user.orgType==7){
        this.projectBidByProjectId()
      }
    } else {
      this.topRadio = "1";
    }
    this.searchContracts();
  },
  methods: {
    selectIds(arr,obj){
      console.log('获取到的',arr,obj);
      if(arr.length){
        if(arr.length>1){
          this.searchData={
            ...this.searchData,
            isWhole: 0,
            fkProjectId: arr[1],
            customerOrWorkArea: 0
          }
          this.fkProjectId = arr[1]
        }else{
          this.searchData={
            ...this.searchData,
            isWhole: 0,
            fkProjectId: arr[0],
            customerOrWorkArea: 0
          }
          this.fkProjectId = arr[0]
        }
      }
    },
    searchContracts() {
      let data = {
        contractType: this.topRadio == 1||this.user.orgType==7 ? 4 : 1,
        fkProjectId:this.fkProjectId
        // customId
      };
      this.$api.searchContracts(data).then(res => {
        if (res.code == 200) {
          this.contractData = res.data;
          if (this.contractData.length) {
            this.searchData.contractId = this.contractData[0].pkId;
          }else{
            this.searchData.contractId =""
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (index != 6 && index != 8 && index != 9) {
          sums[index] = "";
          return;
        }
        const values = data.map(item => Number(item[column.property]));
        if (!values.every(value => isNaN(value))) {
          sums[index] =!this.pricePermission ? "***" : (values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0)).toFixed(2);
          // sums[index] += ' 元';
        } else {
          sums[index] = "N/A";
        }
        // if(sums[index]  )
        // console.log(sums[index])
        sums[9] = (((sums[8] - 0) / sums[6]) * 100).toFixed(2) + "%";
      });

      return sums;
    },
    expandChange(row, expend, ref) {
      if (row.grade == 1 && expend) {
        this.forArr(row.children, true, "tables1");
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
        if (!i.children) {
          return;
        }
        if (!i.children.length) {
          return;
        }
        // toggleRowExpansion(i, isExpand)用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中）
        this.$refs[ref].toggleRowExpansion(i, isExpand);
        if (i.children && i.children.length) {
          this.forArr(i.children, isExpand, ref);
        }
      });
    },
    // 获取实际完成表
    getActualFinishList() {
      this.loading = true;
      api
        .searchActual(this.searchData)
        .then(res => {
          if (res.code === 200) {
            if (res.data) {
              this.tableData = res.data;
              if (this.radio == 2) {
                this.detailRadio = "0";
              }
            } else {
              this.tableData = [];
            }

            this.ranKey1 = Math.random();
            this.ranKey2 = Math.random();
            this.$refs.tables1.bodyWrapper.scrollTo(0, 0);
            this.$refs.tables2.bodyWrapper.scrollTo(0, 0);
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },

    // 获取项目部
    // getItemListByCustom() {
    //   api.getItemListByCustom().then(res => {
    //     if (res.code === 200) {
    //       this.options = res.data;
    //       if (res.data.length) {
    //         this.fkProjectId = res.data[0].pkId;
    //         this.searchData = {
    //           ...this.searchData,
    //           isWhole: 0,
    //           fkProjectId: res.data[0].pkId,
    //           customerOrWorkArea: 0
    //         };
    //       }
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    // },
    projectBidByProjectId(){
      this.$api.projectBidByProjectId().then(res=>{
        if(res.code==200){
          if (res.data.length) {
            this.fkProjectId = res.data[0].pkId;
          }
          this.proOptions = res.data.map(item => ({ ...item, label: item.projectName, value: item.pkId }));
        }else {
          this.$message.warning(res.msg);
        }
      })
    },
    // 获取所有项目部
    getAllProject() {
      this.$api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          if ([2, 3, 9].includes(this.user.orgType)) {
            this.options = res.data.map(item => ({ ...item, label: item.projectName, value: item.pkId }));
            if (res.data.length) {
              this.proId = res.data[0].pkId;
              this.allListBidByProId(0, res.data[0].pkId);
            }
          } else {
            if (res.data.length) {
              this.fkProjectId = res.data[0].pkId;
            } else {
              delete this.searchData.fkProjectId;
              this.searchData = {
                ...this.searchData,
                isWhole: 1,
                customerOrWorkArea: 0
              };
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
            this.fkProjectId = res.data[0].fkBidProjectId;
          } else {
            delete this.searchData.fkProjectId;
            this.searchData = {
              ...this.searchData,
              isWhole: 1,
              customerOrWorkArea: 0
            };
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 选择项目部
    proChange(e) {
      if (e) {
        this.allListBidByProId(0, e);
      }
    },
    // 获取分包单位
    getSubList() {
      api.findCustomByUserId().then(res => {
        if (res.code === 200) {
          this.subOption = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取工区
    getAreaList() {
      api
        .findWorkAreasByUserId({
          userId: JSON.parse(localStorage.getItem("userId"))
        })
        .then(res => {
          if (res.code === 200) {
            this.areaOption = res.data;
          } else {
            this.$message.warning(res.msg);
          }
        });
    },
    // 改变项目部
    // proBidChange(val) {
    //   if (val) {
    //     this.searchData = {
    //       ...this.searchData,
    //       isWhole: 0,
    //       fkProjectId: val,
    //       customerOrWorkArea: 0
    //     };
    //   } else {
    //     delete this.searchData.fkProjectId;
    //     this.searchData = {
    //       ...this.searchData,
    //       isWhole: 1,
    //       customerOrWorkArea: 0
    //     };
    //   }
    //   // if (this.fkProjectId.length) {
    //   //   let index = this.fkProjectId.findIndex(item => item === "");
    //   //   if (this.fkProjectId[this.fkProjectId.length - 1] === "") {
    //   //     this.fkProjectId = [""];
    //   //     delete this.searchData.fkProjectId;
    //   //     this.searchData = {
    //   //       ...this.searchData,
    //   //       isWhole: 1,
    //   //       customerOrWorkArea: 0
    //   //     };
    //   //   } else {
    //   //     if (index !== -1) {
    //   //       this.fkProjectId.splice(index, 1);
    //   //     }
    //   //     this.searchData = {
    //   //       ...this.searchData,
    //   //       isWhole: 0,
    //   //       fkProjectId: this.fkProjectId.join(","),
    //   //       customerOrWorkArea: 0
    //   //     };
    //   //   }
    //   // } else {
    //   //   delete this.searchData.fkProjectId;
    //   //   this.searchData = {
    //   //     ...this.searchData,
    //   //     isWhole: 1,
    //   //     customerOrWorkArea: 0
    //   //   };
    //   // }
    // },
    // 改变分包单位
    subChange() {
      if (this.customerIds.length) {
        let index = this.customerIds.findIndex(item => item === "");
        if (this.customerIds[this.customerIds.length - 1] === "") {
          this.customerIds = [""];
          delete this.searchData.customerIds;
          this.searchData = {
            ...this.searchData,
            isWhole: 1,
            customerOrWorkArea: 0
          };
        } else {
          if (index !== -1) {
            this.customerIds.splice(index, 1);
          }
          this.searchData = {
            ...this.searchData,
            isWhole: 0,
            customerIds: this.customerIds.join(","),
            customerOrWorkArea: 0
          };
        }
      } else {
        delete this.searchData.customerIds;
        this.searchData = {
          ...this.searchData,
          isWhole: 1,
          customerOrWorkArea: 0
        };
      }
    },
    // 工区变化
    areaChange() {
      if (this.workAreaIds.length) {
        let index = this.workAreaIds.findIndex(item => item === "");
        if (this.workAreaIds[this.workAreaIds.length - 1] === "") {
          this.workAreaIds = [""];
          delete this.searchData.workAreaIds;
          this.searchData = {
            ...this.searchData,
            isWhole: 1,
            customerOrWorkArea: 1
          };
        } else {
          if (index !== -1) {
            this.workAreaIds.splice(index, 1);
          }
          this.searchData = {
            ...this.searchData,
            isWhole: 0,
            workAreaIds: this.workAreaIds.join(","),
            customerOrWorkArea: 1
          };
        }
      } else {
        delete this.searchData.workAreaIds;
        this.searchData = {
          ...this.searchData,
          isWhole: 1,
          customerOrWorkArea: 1
        };
      }
    },
    changeTopRadio() {
      // this.radio = 1;
      this.isExpand = false;
      this.searchContracts();
    }
  },
  computed: {
    pricePermission() {
      let arr = this.$store.state.menuData.filter(item => item.menuCode == "schedule");
      if (![0].includes(this.user.orgType)) {
        return arr.length ? !!arr[0].states : false;
      } else {
        return true;
      }
    },
    labelName() {
      if (this.user.orgType === 5 && this.topRadio == 1) {
        return "分包单位";
      }
      if (this.user.orgType === 5 && this.topRadio == 2) {
        return "工区";
      }
      return "项目部";
    },
    showList() {
      if (this.tableData.length) {
        if (this.finished === 0) {
          return this.tableData.filter(item => item.completionStatus === 1);
        } else if (this.finished === 1) {
          return this.tableData.filter(item => item.completionStatus === 2);
        } else {
          return this.tableData;
        }
      }
      return this.tableData;
    },
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  watch: {
    topRadio(val) {
      // this.radio = 1;
      this.Echartradio = 1;
      delete this.searchData.customerIds;
      delete this.searchData.workAreaIds;
      delete this.searchData.fkProjectId;
      if (val == 1) {
        this.getSubList();
        this.searchData = {
          ...this.searchData,
          isWhole: 1,
          customerOrWorkArea: 0
        };
      } else if (val == 2) {
        this.getAreaList();
        this.searchData = {
          ...this.searchData,
          isWhole: 1,
          customerOrWorkArea: 1
        };
      } else {
        this.getItemListByCustom();
      }
    },
    searchData: {
      handler(val) {
        console.log(val);
        this.getActualFinishList();
        this.finished = "";
      },
      deep: true
    },
    fkProjectId(val) {
      this.searchContracts();
      if (val) {
        this.searchData = {
          ...this.searchData,
          isWhole: 0,
          fkProjectId: val,
          customerOrWorkArea: 0
        };
      } else {
        delete this.searchData.fkProjectId;
        this.searchData = {
          ...this.searchData,
          isWhole: 1,
          fkProjectId: "",
          customerOrWorkArea: 0
        };
      }
    },
    radio(val) {
      this.tableData = [];
      if (val === 1) {
        this.searchData.contractId =""
        // this.searchData.isItemDetail = 0;
        this.searchData = { ...this.searchData, isItemDetail: 0, fkProjectId: this.searchData.fkProjectId ? this.searchData.fkProjectId : "" };
      } else if (val === 2) {
        // this.searchData.isItemDetail = 1;
        this.searchContracts();
        this.searchData = { ...this.searchData, isItemDetail: 1, fkProjectId: this.searchData.fkProjectId ? this.searchData.fkProjectId : "" };
      }
    }
  }
};
</script>

<style lang="scss" scoped>
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
/deep/.el-select {
  .el-select__tags-text {
    max-width: 100px;
  }
}
/deep/ .el-tabs__header {
  background-color: #fff;
}

/deep/ .el-tabs__nav-wrap {
  padding-left: 20px;
}
.table-data {
  /deep/ .el-tabs__content {
    height: 100%;
  }
}
</style>
