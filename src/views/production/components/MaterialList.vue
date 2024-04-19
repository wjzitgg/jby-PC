<template>
  <div>
    <el-dialog :close-on-press-escape="false" title="分项工程材料表" v-if="materialDialog" :visible="materialDialog" @close="handleClose(1)" width="80%" center v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form">
        <SearchBar>
          <template slot="left">
            <el-radio-group v-model="radio" size="mini">
              <el-radio-button :label="1">分项材料表</el-radio-button>
              <el-radio-button :label="2">材料汇总表</el-radio-button>
            </el-radio-group>
          </template>
          <template slot="right">
            <el-button type="primary" class="el-button-primary" size="mini" @click="openItemListDialog" v-if="dialogType === 2">设置分项材料表</el-button>
          </template>
        </SearchBar>
        <div class="tables table-data">
          <!-- use-virtual -->
          <pl-table :data="showTableTree" :height="500" v-loading="loading2" use-virtual :key="randomKey" :tree-config="{ children: 'children', indent: 5 }" v-show="radio === 1" @expand-change="expandChange" :dataChangesScrollTop="false" :tree-props="{ children: 'children' }" row-key="myId" ref="tables1" :header-cell-style="{ background: '#f1f6ff' }">
            <!-- <pl-table-column align="center" label="序号" type="index" width="80"></pl-table-column> -->
            <pl-table-column align="center" prop="itemCode" width="120" :key="randomKey" :treeNode="true" show-overflow-tooltip>
              <template slot="header" slot-scope="scope" :cleanRed="scope">
                <i class="el-icon-s-operation" style="color:#1295d9;cursor: pointer;" @click="handleExpand('tables1', 'isExpand', 'tableTree')"></i>
                <span>项目编号</span>
              </template>
            </pl-table-column>
            <pl-table-column align="center" label="项目名称【专业类别】" prop="itemName" show-overflow-tooltip> 
              <template slot-scope="{ row }">
                {{row.itemName + (row.grade==1?` 【${row.professionalName}】`:'')}}
              </template>
            </pl-table-column>
            <pl-table-column align="center" label="设计使用量" width="150">
              <template slot-scope="{ row }">
                <div class="el-input el-input--mini" :class="{ 'is-disabled': !row.itemStatus }" v-if="dialogType === 2">
                  <!--  oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,6})?).*$/g, '$1')" @blur="row.signNum = $event.target.value" -->
                  <input class="el-input__inner" v-model.trim="row.signNum" type="text" @input="materialChange($event, row)" v-if="row.grade === 4" :disabled="!row.itemStatus" @blur="row.signNum = row.signNum - 0"/>
                </div>
                <span v-if="dialogType === 1">{{ row.signNum }}</span>
              </template>
            </pl-table-column>
            <pl-table-column align="center" label="单位" prop="unitName" width="120"> </pl-table-column>
            <div slot="empty" class="empty" style="width: 100%;height:100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </pl-table>
          <pl-table height="500" :data="tableDate2" :header-cell-style="{ background: '#f1f6ff' }" v-show="radio === 2">
            <pl-table-column label="材料类型" align="center">
              <template slot-scope="{ row }">
                <span v-if="!row.unitName">{{ row.materialType }}</span>
              </template>
            </pl-table-column>
            <pl-table-column label="材料名称" prop="itemName" align="center"></pl-table-column>
            <pl-table-column label="设计使用量" prop="signNum" align="center"></pl-table-column>
            <pl-table-column label="单位" prop="unitName" align="center"></pl-table-column>
            <div slot="empty" class="empty" style="width: 100%;height:100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </pl-table>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" class="el-button-primary" @click="handleEdit" v-show="dialogType === 1 && !setShow" v-has="'production:setting:itemMaterialEdit'">修 改</el-button>
        <el-button type="warning" class="print" @click="print" v-show="dialogType === 1 && !setShow" v-has="'production:setting:itemMaterialPut'">打 印</el-button>
        <el-button type="primary" class="export" @click="exportss" v-show="dialogType === 1 && !setShow" v-has="'production:setting:itemMaterialOut'">导 出</el-button>
        <el-button type="primary" class="el-button-primary" @click="openItemListDialog" v-show="dialogType === 1 && setShow" v-has="'production:setting:itemMaterialEdit'">设置分项材料</el-button>
        <el-button type="primary" class="el-button-primary" @click="handleSave" v-show="dialogType === 2">保 存</el-button>
        <el-button type="primary" plain @click="handleClose2" v-show="dialogType === 2">取 消</el-button>
        <!-- <el-button @click="handleClose(2)" v-if="dialogType===1">关 闭</el-button> -->
      </span>
    </el-dialog>
    <!-- 设置分项表弹框 -->
    <el-dialog title="选择分项工程材料" :visible.sync="itemListDialog" v-loading="loading3" @close="handleCloseItemListDialog" center width="40%" v-dialogDrag :close-on-click-modal="false">
      <div class="itemDialog dialog-form">
        <!-- <div class="header">请选择清单</div> -->
        <div class="main">
          <!-- @check-change="checkNode" check-on-click-node :expand-on-click-node="false"  node-key="pkId"-->
          <virtualNodeTree default-expand-all :data="checkList" :props="defaultProps" ref="checkList" v-if="itemListDialog" :expand-on-click-node="false">
            <span slot-scope="{ node, data }">
              <el-tooltip effect="dark" :content="node.label" placement="bottom-start" :disabled="isShowTooltip">
                <div :class="'label' + data.grade" @mouseenter="onMouseEnter(`label${data.grade + String(node.id)}`)">
                  <!-- <span :ref="'label' + data.grade + String(node.id)" @click="nodeClick(data,node)" :class="{ blue: data.materTypeStatus&&data.itemStatus }">{{ node.label + (!!data.materTypeStatus && !!data.checkStatus&&data.itemStatus ? "(待选)" :data.grade===4 && data.child.filter(item=>item.systemType).length ? '(自定义)': "") }}</span> -->
                  <!-- <i class="el-icon-s-tools" v-if="data.grade ==3" @click.stop="custom(data)"></i> -->
                  <span :ref="'label' + data.grade + String(node.id)" @click="nodeClick(data, node)" :class="{ blue: data.pkId.indexOf('add') !== -1 }">
                    <i class="add el-icon-plus" v-if="data.pkId.indexOf('add') !== -1"></i>
                    {{ node.label + (data.grade === 4 && data.child.filter(item => item.systemType).length ? "(自定义)" : "") }}
                  </span>
                </div>
              </el-tooltip>
            </span>
          </virtualNodeTree>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" class="el-button-primary" @click="handleSaveLinkList">下一步</el-button>
      </span>
    </el-dialog>
    <el-dialog title="设置分项工程材料" width="30%" center :visible="setMaterialDialog" @close="closeSetMaterialDialog" v-dialogDrag :close-on-click-modal="false">
      <div class="setMaterialDialog dialog-form" ref="setMaterialDialog">
        <!-- <virtualNodeTree class="materialTree" default-expand-all :data='showMaterialList' show-checkbox :expand-on-click-node='false' check-strictly ref="materialTree">
        </virtualNodeTree> -->
        <el-checkbox-group v-model="selectList" @change="checkboxChange">
          <el-checkbox v-for="item in showMaterialList" :label="item.pkId" :key="item.pkId">{{ item.itemName }}</el-checkbox>
        </el-checkbox-group>
      </div>
      <div slot="footer">
        <el-button type="primary" class="el-button-primary" @click="setMaterialDialogOk">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="自定义材料" width="30%" center :visible="customShow" @close="closeCustom" v-dialogDrag :close-on-click-modal="false">
      <div class="setMaterialDialog dialog-form" ref="setMaterialDialog">
        <el-tree :data="customData" ref="tree" :default-expand-all="true" show-checkbox node-key="pkId" :props="customProps"> </el-tree>
      </div>
      <div slot="footer">
        <el-button type="primary" class="el-button-primary" @click="customPreserve">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SearchBar from "./SearchBar.vue";
import elTree2 from "../../../utils/tree/src/tree.vue";
import { extractTree, listToTree } from "@/utils/commond";
import virtualNodeTree from "../../../components/virtualNodeTree/tree.vue";
import lodash from "lodash";
import printJs from "print-js";
import utils from "@/utils/util";
export default {
  components: { SearchBar, elTree2, virtualNodeTree },
  props: {
    materialDialog: {
      type: Boolean,
      default: false
    },
    orgType: {
      type: Number
    },
    fkOrgId: ""
  },
  data() {
    return {
      dialogType: 1, //1为预览，2为编辑
      loading: false,
      randomKey: Math.random(),
      tableDate: [],
      cloneTableDate: [],
      checkList: [],
      cloneCheckList: [],
      sendList: [],
      selectList: [],
      defaultProps: {
        label: "name",
        children: "child"
        // disabled: this.treeDisabled
      },
      itemListDialog: false,
      loading2: false,
      loading3: false,
      radio: 1,
      isShowTooltip: true,
      // setProMa: false,
      setMaterialDialog: false,
      materialList: [],
      showMaterialList: [],
      nowClickNode: {},
      parentId: "",
      isChange1: false,
      tableTree: [],
      addIndex: 0,
      isExpand: false,
      customData: [],
      arr1: [],
      arr2: [],
      customShow: false,
      customProps: {
        label: "name",
        children: "materialVoList"
      },
      customRawData: {},
      setShow: false,
      getTableList: [],
      timers: null,
      getTreeData: {
        customMaterialVoList: [],
        sysMaterialVoList: []
      }
    };
  },
  computed: {
    tableDate2() {
      if (this.dialogType == 1) {
        return this.getTableList;
      } else {
        let arr = this.tableDate.filter(item => item.grade === 4);
        let arr2 = [];
        for (var i = 0; i < arr.length; i++) {
          var flag = true;
          for (var j = 0; j < arr2.length; j++) {
            if (arr[i].materialTypeId === arr2[j].materialTypeId) {
              flag = false;
            }
          }
          if (flag) {
            arr2.push({
              materialTypeId: arr[i].materialTypeId,
              materialType: arr[i].materialType,
              myId: arr[i].materialTypeId,
              itemName: "",
              signNum: "",
              unitName: "",
              prodItemLists: []
            });
          }
        }
        for (var i = 0; i < arr2.length; i++) {
          for (var j = 0; j < arr.length; j++) {
            var flag = true;
            if (arr2[i].materialTypeId === arr[j].materialTypeId) {
              for (var k = 0; k < arr2[i].prodItemLists.length; k++) {
                if (arr2[i].prodItemLists[k].pkId === arr[j].pkId) {
                  flag = false;
                  arr2[i].prodItemLists[k].signNum = (arr2[i].prodItemLists[k].signNum - 0 + (arr[j].signNum - 0)).toFixed(6) - 0;
                }
              }
              if (flag) {
                arr2[i].prodItemLists.push({ ...arr[j] });
              }
            }
          }
        }
        let arr3 = this.treeToArr(arr2);
        return arr3;
      }
    },
    showTableTree() {
      this.tableTree.forEach(item => {
        item.children.forEach(item2 => {
          item2.children.forEach(item3 => {
            if (item3.children.length) {
              item3.show = 1;
            } else {
              item3.show = 0;
            }
          });
          if (item2.children.filter(ite => ite.show).length) {
            item2.show = 1;
          } else {
            item2.show = 0;
          }
        });
        if (item.children.filter(ite => ite.show).length) {
          item.show = 1;
        } else {
          item.show = 0;
        }
      });
      let arr = this.tableTree.filter(item => {
        item.children = item.children.filter(item2 => {
          item2.children = item2.children.filter(item3 => item3.show);
          return item2.show;
        });
        return item.show;
      });
      return arr;
    }
  },
  methods: {
    print() {
      this.loading = true;
      this.$api
        .printPDFMaterial({ fkOrgId: this.fkOrgId })
        .then(res => {
          this.loading = false;
          if (res.code == 200) {
            printJs({ printable: res.data.url, type: "pdf" });
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    exportss() {
      this.loading = true;
      this.$api
        .exportMaterial({ fkOrgId: this.fkOrgId })
        .then(res => {
          this.loading = false;
          if (res.code == 200) {
            utils.downFile(res.data.url, res.data.fileName);
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    effective() {
      this.$api.effective({ token: sessionStorage.getItem("token") }).then(res => {
        if (res.code == 200) {
          if (res.data.isEffective) {
            this.clearTimer();
            this.$alert(res.data.errorMsg, "账号退出提示", {
              confirmButtonText: "重新登录",
              cancelButtonText: "返回首页",
              type: "warning",
              showClose: false,
              showCancelButton: true,
              callback: action => {
                if (action == "cancel") {
                  this.$router.push("/login");
                } else {
                  this.$store.commit("setLoginDialog", true);
                  this.$store.commit("setTokenSign", res.data.tokenSign);
                }
              }
            });
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    openTimer() {
      this.clearTimer();
      this.effective();
      this.timers = setInterval(() => {
        this.effective();
      }, 10000);
    },
    clearTimer() {
      clearInterval(this.timers);
    },
    searchMaterialSummary() {
      this.$api.searchMaterialSummary({ fkOrgId: this.fkOrgId }).then(res => {
        if (res.code === 200) {
          this.getTableList = res.data.map(item => ({ ...item, itemName: item.materialName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeCustom() {
      this.customShow = false;
    },
    custom(data) {
      // return console.log(data)
      console.log(data);
      this.loading3 = true;
      this.customRawData = data;
      this.parentId = data.pkId;
      this.arr2 = [];
      data.child.forEach(item => {
        item.child.forEach(e => {
          this.arr2.push(e.pkId);
        });
      });
      this.$api.searchCustomMaterial({ itemId: data.pkId }).then(res => {
        if (res.code == 200) {
          this.loading3 = false;
          res.data.forEach(item => {
            item.name = item.materialTypeName;
            item.pkId = item.materialTypeId;
            item.parentTopicId = null;
            item.materialVoList.forEach(e => {
              e.name = e.itemName;
              e.parentTopicId = e.materialTypeId;
            });
          });

          this.customData = res.data;
          this.customShow = true;
        } else {
          this.loading3 = false;
          this.$message(res.msg);
        }
      });
    },

    customPreserve() {
      // let arr1 = this.$refs.tree.getCheckedNodes(false, true).filter(item=>item.pkId!='1'&&item.pkId!='2')
      let nodes = this.$refs.tree.getCheckedNodes(false, true).filter(item => item.pkId != "1" && item.pkId != "2");
      let arr1 = JSON.parse(JSON.stringify(nodes));
      let arr2 = [];

      arr1.forEach(item => {
        if (item.parentTopicId == null) {
          item.child = [];
          delete item.materialVoList;
          arr2.push(item);
        }
      });

      arr2.forEach(item => {
        arr1.forEach(e => {
          if (item.pkId == e.parentTopicId) {
            item.child.push(e);
          }
        });
      });

      // arr2.forEach(item => {
      //   this.customRawData.child.push(item)
      // })
      let addObj = this.customRawData.child.filter(item => item.pkId.indexOf("add") != -1)[0];
      this.customRawData.child = [...arr2, addObj];
      this.customRawData.child.splice(this.customRawData.child.length - 1, 0, ...arr2);
      this.customRawData.child = this.arrayUnique(this.customRawData.child, "pkId");
      let addArr = [];
      // arr2.map(item=>({...item,grade:4,parentId:this.parentId}))
      let index = this.cloneTableDate.findIndex(item => item.pkId === this.parentId);
      let arr3 = this.cloneTableDate
        .filter(item => {
          if (item.parentId === this.parentId && this.parentId === this.nowClickNode.pkId) {
          } else {
            return item;
          }
        })
        .map(item => ({ ...item }));
      let arr4 = this.cloneTableDate.filter(item => item.parentId === this.parentId);
      let hasId = arr4.map(item => item.pkId);
      arr2.forEach(item => {
        item.child.forEach(item2 => {
          if (!hasId.includes(item2.pkId)) {
            addArr.push({ ...item2, grade: 4, parentId: this.parentId });
          } else {
            addArr.push({ ...item2, grade: 4, parentId: this.parentId });
          }
        });
      });
      arr3.splice(
        index + 1,
        0,
        ...addArr.map(item => {
          let obj = arr4.filter(item2 => item2.pkId === item.pkId);
          console.log(obj.length ? obj[0].myId : this.addIndex + 1);
          this.addIndex += 1;
          return { ...item, signNum: obj.length ? obj[0].signNum : "", myId: obj.length ? obj[0].myId : this.addIndex };
        })
      );
      this.cloneTableDate = arr3;
      this.closeCustom();
    },
    arrayUnique(arr, name) {
      let hash = {};
      return arr.reduce((acc, cru, index) => {
        if (!hash[cru[name]]) {
          hash[cru[name]] = { index: acc.length };
          acc.push(cru);
        } else {
          acc.splice(hash[cru[name]]["index"], 1, cru);
        }
        return acc;
      }, []);
    },

    listToTree(list, myId) {
      const children = [];
      list.forEach(item => {
        if (item.parentId === myId) {
          item.children = this.listToTree(list, item.pkId);
          children.push(item);
        }
      });
      return children;
    },
    // 查询分项材料表
    searchItemMaterial() {
      this.$api.searchItemMaterial({ fkOrgId: this.fkOrgId }).then(res => {
        if (res.code === 200) {
          let arr = res.data.map((item, index) => ({ ...item, myId: index + 1 }));
          this.addIndex = res.data.length;
          this.tableDate = arr;
          let tree = this.listToTree(arr, "0");
          this.tableTree = tree;
          if (this.dialogType == 1) {
            this.searchMaterialSummary();
          }
          if (arr.filter(item => item.grade === 4).length) {
            this.setShow = false;
          } else {
            this.setShow = true;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取已选择的系统材料树
    searchItemListMaterialTypeTree() {
      this.$api.searchItemListMaterialTypeTree({ fkOrgId: this.fkOrgId }).then(res => {
        if (res.code === 200) {
          console.log(res.data);
          res.data.forEach(item => {
            item.child.forEach(item2 => {
              item2.child.forEach(item3 => {
                item3.child.push({ pkId: "add" + item3.pkId, name: "选择物料" });
              });
            });
          });
          this.checkList = res.data;
          this.cloneCheckList = lodash.cloneDeep(res.data);
          console.log(1);
          // this.cloneCheckList=res.data.map(item=>({...item,child:item.child.map(item2=>({...item2,child:item2.child.map(item3=>({...item3,child:item3.child.map(item4=>({...item4,child:item4.child}))}))}))}))
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取可以选择的物料
    searchAllowableMaterials() {
      this.$api.searchAllowableMaterials({ fkOrgId: this.fkOrgId }).then(res => {
        if (res.code === 200) {
          this.materialList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取分项工程表
    // getItemList() {
    //   this.loading2 = true;
    //   this.$api
    //     .searchItems({ isLevel: 3, fkOrgId: this.fkOrgId })
    //     .then(res => {
    //       if (res.code === 200) {
    //         if (res.data && res.data.length) {
    //           this.setProMa = res.data.filter(item => item.isQuote === 3).length ? true : false;
    //         }
    //         this.checkList = res.data.map((item, index) => ({
    //           ...item,
    //           myId: String(index),
    //           pid: 0,
    //           prodItemLists: item.prodItemLists.map((item2, index2) => ({
    //             ...item2,
    //             myId: [index, index2].join("-"),
    //             pid: String(index),
    //             prodItemLists: item2.prodItemLists.map((item3, index3) => ({
    //               ...item3,
    //               myId: [index, index2, index3].join("-"),
    //               pid: [index, index2].join("-"),
    //               prodItemLists: item3.materials
    //                 ? item3.materials.map((item4, index4) => ({
    //                     ...item4,
    //                     myId: [index, index2, index3, index4].join("-"),
    //                     pid: [index, index2, index3].join("-")
    //                   }))
    //                 : [],
    //               materials: item3.materials
    //                 ? item3.materials.map((item4, index4) => ({
    //                     ...item4,
    //                     myId: [index, index2, index3, index4].join("-"),
    //                     pid: [index, index2, index3].join("-")
    //                   }))
    //                 : []
    //             }))
    //           }))
    //         }));
    //         let arr = this.checkList.map((item, index) => ({
    //           ...item,
    //           prodItemLists: item.prodItemLists.map(item2 => ({
    //             ...item2,
    //             prodItemLists: item2.prodItemLists.map(item3 => ({
    //               ...item3,
    //               prodItemLists: item3.prodItemLists
    //                 ? item3.prodItemLists
    //                     .filter(item4 => item4.isChoose)
    //                     .map(item5 => ({
    //                       ...item5
    //                     }))
    //                 : []
    //             }))
    //           }))
    //         }));
    //         this.tableDate = this.treeToArr(arr);
    //         this.$nextTick(() => {
    //           this.sendList = arr.map(item => ({
    //             ...item,
    //             prodItemLists: item.prodItemLists.map(item2 => ({
    //               ...item2,
    //               prodItemLists: item2.prodItemLists.map(item3 => ({
    //                 ...item3,
    //                 prodItemLists: item3.prodItemLists.map(item4 => ({
    //                   ...item4
    //                 }))
    //               }))
    //             }))
    //           }));
    //         });
    //       } else {
    //         this.$message.warning(res.msg);
    //       }
    //       this.loading2 = false;
    //     })
    //     .catch(err => {
    //       this.loading2 = false;
    //     });
    // },
    // 把树形数据转为扁平数据
    treeToArr(list) {
      return extractTree(list, "prodItemLists", ["signNum", "fkNumberUnitId", "fkProjectId", "fkSysItemDetailId", "fkSysItemId", "fkSysParentId", "fkUnitId", "fkWorkflowId", "grade", "itemCode", "itemName", "itemType", "number", "numberUnit", "pkId", "prodItemListAdds", "reItemMaterials", "sortval", "unitName", "unitQuantity", "parentId", "index", "faIndex", "fkWorkflowTemplateId", "detailTables", "pid", "myId", "materials", "fkParentId", "isChoose", "unitName", "reItemDrawings", "workflowName", "isQuote", "materialTypeId", "materialType", "isChooseByArea"]);
    },
    // 保存物料表
    handleSave() {
      let arr = this.tableDate.filter(item => item.grade === 4).map(item => ({ designQuantities: item.signNum, fkItemId: item.parentId, fkMaterialId: item.pkId }));
      this.loading = true;
      this.$api
        .addAndUpdateMaterial(arr)
        .then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg);
            this.dialogType = 1;
            this.searchMaterialSummary();
            this.isChange = false;
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 关闭弹框
    handleClose(type) {
      if (type === 1) {
        if (this.isChange) {
          this.$confirm("是否取消，取消后新增加的数据将不保存", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(() => {
            this.$emit("update:materialDialog", false);
            this.isChange = false;
            this.dialogType = 1;
          });
        } else {
          this.$emit("update:materialDialog", false);
          this.isChange = false;
          this.dialogType = 1;
        }
      } else {
        this.$emit("update:materialDialog", false);
        this.isChange = false;
      }
      this.isExpand = false;
      this.setShow = false;
    },
    handleClose2() {
      if (this.isChange) {
        this.$confirm("是否取消，取消后新增加的数据将不保存", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          this.setShow = false;
          this.searchItemMaterial();
          this.dialogType = 1;
          this.isChange = false;
        });
      } else {
        this.setShow = false;
        this.isChange = false;
        this.dialogType = 1;
      }
    },
    // 打开分项表设置弹框
    openItemListDialog() {
      // if (this.setProMa) {
      //   return this.$message.warning("存在未完成的生产审批流程");
      // }
      this.loading3 = true;
      this.cloneTableDate = this.tableDate.map(item => ({ ...item }));
      this.itemListDialog = true;
      setTimeout(() => {
        this.loading3 = false;
      }, 1500);
      // this.$nextTick(() => {
      //   this.$refs.checkList.setCheckedNodes(this.tableDate.filter(item => item.grade === 4));
      // });
    },
    // nodeClick(data, node) {
    //   if (data.materTypeStatus === 1) {
    //     if(!data.itemStatus){
    //       return
    //     }
    //     console.log(data, node);
    //     this.nowClickNode = data;
    //     this.parentId=node.parent.data.pkId
    //     // this.nowClickNode.child.forEach(item=>{
    //     //   this.tableDate.forEach
    //     // })
    //     this.selectList = data.child.map(item => item.pkId);
    //     let arr = this.materialList.filter(item => item.materialTypeId===data.pkId);
    //     this.showMaterialList = arr.length ? arr[0].materialVoList : [];
    //     this.setMaterialDialog = true;
    //     this.$nextTick(()=>{
    //       this.$refs.setMaterialDialog.scrollTo(0,0)
    //     })
    //   }
    // },
    nodeClick(data, node) {
      if (data.pkId.indexOf("add") == -1) {
        return;
      }
      let parentObj = node.parent.data;
      this.customRawData = parentObj;
      this.nowClickNode = parentObj;
      this.parentId = node.parent.data.pkId;
      this.itemType = node.parent.data.itemType;
      let arr = [];
      console.log(parentObj);
      parentObj.child.forEach(item => {
        if (item.pkId.indexOf("add") == -1) {
          item.child.forEach(item2 => {
            arr.push(item2.pkId);
          });
        }
      });
      this.selectList = arr;
      this.$api.getAllowableMaterials({ itemId: parentObj.pkId }).then(res => {
        if (res.code == 200) {
          console.log("获取的", res.data);
          res.data.customMaterialVoList.forEach(item => {
            item.name = item.materialTypeName;
            item.pkId = item.materialTypeId;
            item.parentTopicId = null;
            item.materialVoList.forEach(e => {
              e.name = e.itemName;
              e.parentTopicId = e.materialTypeId;
            });
          });
          res.data.sysMaterialVoList.forEach(item => {
            item.name = item.materialTypeName;
            item.pkId = item.materialTypeId;
            item.parentTopicId = null;
            item.materialVoList.forEach(e => {
              e.name = e.itemName;
              e.parentTopicId = e.materialTypeId;
            });
          });
          this.getTreeData = res.data;
          if (res.data.customMaterialVoList.length) {
            this.customData = [
              { name: "系统物料", pkId: "1", materialVoList: res.data.sysMaterialVoList },
              { name: "自定义物料", pkId: "2", materialVoList: res.data.customMaterialVoList }
            ];
          } else {
            this.customData = res.data.sysMaterialVoList;
          }
          this.customShow = true;
          this.$nextTick(() => {
            this.$refs.tree.setCheckedKeys(arr);
          });
        } else {
          this.$message.warning(res.msg);
        }
      });
      console.log("進入", data, node, this.selectList);
    },
    // 关闭分项表设置弹框
    handleCloseItemListDialog() {
      this.itemListDialog = false;
      this.checkList = lodash.cloneDeep(this.cloneCheckList);
    },
    // 选中节点复选框触发的函数
    // checkNode(data, checked) {
    //   if (checked && data.grade === 4) {
    //     this.sendList.forEach(item => {
    //       item.prodItemLists.forEach(item2 => {
    //         item2.prodItemLists.forEach(item3 => {
    //           item3.materials.forEach(item5 => {
    //             if (!item3.reItemMaterials.filter(item => item.fkMaterialId === data.pkId).length) {
    //               if (item5.myId === data.myId) {
    //                 item5.isChoose = 1;
    //                 item3.reItemMaterials.push({
    //                   fkMaterialId: data.pkId,
    //                   designQuantities: data.designQuantities ? data.designQuantities : 0
    //                 });
    //               }
    //             }
    //           });
    //         });
    //       });
    //     });
    //   } else if (!checked && data.grade === 4) {
    //     this.sendList.forEach(item => {
    //       item.prodItemLists.forEach(item2 => {
    //         item2.prodItemLists.forEach(item3 => {
    //           if (data.pid === item3.myId) {
    //             let index = item3.reItemMaterials.findIndex(item4 => item4.fkMaterialId === data.pkId);
    //             item3.materials.forEach(item5 => {
    //               if (item5.myId === data.myId) {
    //                 item5.isChoose = 0;
    //                 item3.reItemMaterials.splice(index, 1);
    //               }
    //             });
    //           }
    //         });
    //       });
    //     });
    //   }
    // },
    // 保存分项表
    handleSaveLinkList() {
      this.isChange = true;
      this.dialogType = 2;
      this.tableDate = this.cloneTableDate.map(item => ({ ...item }));
      let tree = this.listToTree(this.tableDate, "0");
      this.tableTree = tree;
      this.cloneCheckList = lodash.cloneDeep(this.checkList);
      this.randomKey = Math.random();
      this.isExpand = false;
      this.handleCloseItemListDialog();
      if (this.tableDate.filter(item => item.grade === 4).length) {
        this.setShow = false;
      } else {
        this.setShow = true;
      }
    },
    keyDown(e) {
      let key = e.key;
      if (key === "e" || key === "-") {
        e.returnValue = false;
        return false;
      }
      return true;
    },
    // 禁用树形复选框
    // treeDisabled(data, node) {
    //   if (data.invalidFlag == 1) {
    //     return true;
    //   }
    //   if (data.isQuote && data.isQuote !== 0 && data.isChooseByArea === 1) {
    //     return true;
    //   }
    //   return false;
    // },
    // 改变物料表设计使用量触发的函数
    materialChange(e, row) {
      // clearTimeout(this.timer);
      this.isChange = true;
      let val = e.target.value
      val = this.$limitInputNumber(val,99999999.999999,0,6)
      row.signNum = val?val:0;
      this.tableDate.forEach(item => {
          if (item.myId === row.myId) {
            item.signNum = row.signNum;
          }
        });
        this.$refs.tables1.$children[0]._data.plTreeData.forEach(item => {
          if (item.myId === row.myId) {
            item.signNum = row.signNum;
          }
        });
      // this.timer = setTimeout(() => {
      //   let val = e.target.value - 0;
      //   if (val > 999999999.999999) {
      //     val = 999999999.999999;
      //   }
      //   row.signNum = val;
      //   this.tableDate.forEach(item => {
      //     if (item.myId === row.myId) {
      //       item.signNum = row.signNum;
      //     }
      //   });
      //   this.$refs.tables1.$children[0]._data.plTreeData.forEach(item => {
      //     if (item.myId === row.myId) {
      //       item.signNum = row.signNum;
      //     }
      //   });
      //   // // let val = e.target.value;
      //   // e.target.value = e.target.value.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
      //   // e.target.value = e.target.value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
      //   // e.target.value = e.target.value.replace(/^0+\./g, "0.");
      //   // e.target.value = e.target.value.match(/^0+[1-9]+/) ? (e.target.value = e.target.value.replace(/^0+/g, "")) : e.target.value;
      //   // e.target.value = e.target.value.match(/^\d*(\.?\d{0,6})/g)[0] || "";
      //   // this.tableDate.forEach(item => {
      //   //   if (item.grade === 3) {
      //   //     // console.log("item", item);
      //   //     item.reItemMaterials.forEach(item2 => {
      //   //       if (item2.fkMaterialId === row.pkId && row.pid === item.myId) {
      //   //         item2.signNum = row.designQuantities;
      //   //       }
      //   //     });
      //   //   }
      //   // });
      // }, 200);
    },
    // 树形超过宽度提示
    onMouseEnter(str) {
      const tag = this.$refs[str];
      const parentWidth = tag.parentNode.offsetWidth; // 获取元素父级可视宽度
      const contentWidth = tag.offsetWidth; // 获取元素可视宽度
      this.isShowTooltip = contentWidth <= parentWidth;
    },
    setMaterialDialogOk() {
      let arr = this.selectList.length ? this.showMaterialList.filter(item => this.selectList.includes(item.pkId)) : [];
      this.nowClickNode.checkStatus = arr.length ? 0 : 1;
      this.$set(
        this.nowClickNode,
        "child",
        arr.map(item => ({ ...item, name: item.itemName }))
      );
      // this.nowClickNode.child=arr.map(item=>({...item,name:item.itemName}))
      let addArr = arr.map(item => ({ ...item, grade: 4, parentId: this.parentId }));
      let index = this.cloneTableDate.findIndex(item => item.pkId === this.parentId);
      let arr3 = this.cloneTableDate
        .filter(item => {
          if (item.parentId === this.parentId && item.materialTypeId === this.nowClickNode.pkId) {
          } else {
            return item;
          }
        })
        .map(item => ({ ...item }));
      let arr4 = this.cloneTableDate.filter(item => item.parentId === this.parentId);
      arr3.splice(
        index + 1,
        0,
        ...addArr.map(item => {
          let obj = arr4.filter(item2 => item2.pkId === item.pkId);
          console.log(obj.length ? obj[0].myId : this.addIndex + 1);
          this.addIndex += 1;
          return { ...item, signNum: obj.length ? obj[0].signNum : "", myId: obj.length ? obj[0].myId : this.addIndex };
        })
      );
      this.cloneTableDate = arr3;
      this.closeSetMaterialDialog();
    },
    closeSetMaterialDialog() {
      this.setMaterialDialog = false;
      this.selectList = [];
      this.isChange1 = false;
    },
    checkboxChange() {
      this.isChange1 = true;
    },
    handleEdit() {
      this.dialogType = 2;
    },
    expandChange() {
      this.randomKey = Math.random();
    },
    handleExpand(ref, isExpand, list) {
      this[isExpand] = !this[isExpand];
      this.randomKey = Math.random();
      this.$nextTick(() => {
        // this.forArr(this[list], this[isExpand], ref);
        if (this[isExpand]) {
          this.$refs[ref].setAllTreeExpansion();
        } else {
          this.$refs[ref].clearTreeExpand();
        }
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
    }
  },
  watch: {
    materialDialog(val) {
      if (val) {
        // this.getItemList();
        this.searchItemMaterial();
        this.searchItemListMaterialTypeTree();
        this.searchAllowableMaterials();
      } else {
        this.tableDate = [];
        this.clearTimer();
      }
    },
    dialogType(val) {
      if (val === 1) {
        this.clearTimer();
      } else if (val == 2) {
        this.openTimer();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.table-data {
  padding: 0;
  /deep/ .el-icon-arrow-right:before {
    content: "\e791";
    font-size: 16px;
  }
}
// .tables {
//   height: 500px;
// }
.itemDialog {
  border: 1px solid #d7d7d7;
  .header {
    height: 40px;
    line-height: 40px;
    padding-left: 10px;
    background-color: #e9e9e9;
    font-size: 16px;
    font-weight: 700;
    border-bottom: 1px solid #d7d7d7;
  }
  .main {
    width: 100%;
    height: 500px;
    overflow: auto;
  }
}
/deep/ .el-tree {
  // width: 100%;
  // height: 500px;
  // overflow: auto;
  // 不可全选样式
  // .el-tree-node {
  //   .is-leaf + .el-checkbox .el-checkbox__inner {
  //     display: inline-block;
  //   }
  //   .el-checkbox .el-checkbox__inner {
  //     display: none;
  //   }
  // }
  .label1 {
    width: 500px;
    overflow: hidden; /*超出部分隐藏*/
    white-space: nowrap; /*禁⽌换⾏*/
    text-overflow: ellipsis; /*省略号*/
  }
  .label2 {
    width: 480px;
    overflow: hidden; /*超出部分隐藏*/
    white-space: nowrap; /*禁⽌换⾏*/
    text-overflow: ellipsis; /*省略号*/
  }
  .label3 {
    width: 470px;
    overflow: hidden; /*超出部分隐藏*/
    white-space: nowrap; /*禁⽌换⾏*/
    text-overflow: ellipsis; /*省略号*/
  }
  .label4 {
    width: 460px;
    overflow: hidden; /*超出部分隐藏*/
    white-space: nowrap; /*禁⽌换⾏*/
    text-overflow: ellipsis; /*省略号*/
  }
}
.setMaterialDialog {
  height: 300px;
  overflow: auto;
  /deep/ .el-checkbox {
    display: block;
  }
}
.blue {
  color: #02a7f0;
}
/deep/ .el-tree-node__content {
  .el-checkbox {
    display: none;
  }
}

/deep/ .el-tree-node__children {
  .el-checkbox {
    display: inline-block;
  }
}
/deep/ .el-table__empty-block {
  height: 100%;
}
.export {
  background-color: #8080ff;
}
</style>
