<template>
  <div>
    <el-dialog :close-on-press-escape="false" v-if="ListDialog" title="分项工程清单表" :visible="ListDialog" @close="handleClose(1)" width="80%" center v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form">
        <SearchBar>
          <template slot="right">
            <el-button type="primary" class="el-button-primary" size="mini" @click="openItemListDialog" v-if="dialogType === 2">设置分项清单细目</el-button>
          </template>
        </SearchBar>
        <div class="tables table-data">
          <!-- use-virtual -->
          <pl-table height="500" :data="showTableTree" @expand-change="expandChange" :key="randomKey" :header-cell-style="{ background: '#f1f6ff' }" :tree-props="{ children: 'children' }" use-virtual :tree-config="{ children: 'children', indent: 5 }" row-key="myId" v-loading="loading2" :row-style="selectRowStyle" :dataChangesScrollTop="false" ref="tables1">
            <!-- align="center" -->
            <!-- <pl-table-column  label="序号" type="index" width="80"></pl-table-column> -->
            <!-- width="100" -->
            <!-- align="center" -->
            <pl-table-column prop="itemCode" width="150" :key="randomKey" :treeNode="true" show-overflow-tooltip>
              <template slot="header" slot-scope="scope">
                <i class="el-icon-s-operation" style="color:#1295d9;cursor: pointer;" :cleanRed="scope" @click="handleExpand('tables1', 'isExpand', 'tableTree')"></i>
                <span>项目编号</span>
              </template>
            </pl-table-column>
            <!-- align="center" -->
            <pl-table-column label="项目名称【专业类别】" prop="itemName" show-overflow-tooltip>
              <template slot-scope="{ row, $index }">
                <div class="el-input el-input--mini" v-if="row.grade == 4 && dialogType === 2" :class="{ 'is-disabled': row.isQuote === 1 || row.isQuote === 3 || orgType === 4 || row.isChooseByArea === 1 }">
                  <input v-model.trim="row.itemName" maxlength="100" class="tac el-input__inner" @blur="itemNameChange($event, row, $index)" :disabled="row.isQuote === 1 || row.isQuote === 3 || orgType === 4 || row.isChooseByArea === 1" />
                </div>
                <span v-else>{{ row.itemName + (row.grade==1?` 【${row.professionalName}】`:'') }}</span>
              </template>
            </pl-table-column>
            <!-- align="center" -->
            <pl-table-column label="隧道延长米" width="100">
              <template slot-scope="{ row }">
                <div v-if="row.grade === 3 && row.itemType == 2">
                  <span>{{ row.number }}</span
                  ><span>m</span>
                </div>
              </template>
            </pl-table-column>
            <!-- align="center" -->
            <!-- <pl-table-column  label="设计数量">
            <template slot-scope="{ row }">
              <div v-if="row.grade === 3">
                <span>{{ row.number }}</span>
                {{ row.unitName ? row.unitName : "" }}
              </div>
              <div v-if="row.grade === 4">
                <span>{{
                  row.number + (row.unitName ? row.unitName : "")
                }}</span>
              </div>
            </template>
          </pl-table-column> -->
            <!-- align="center" -->
            <pl-table-column label="每延米工程量" width="280">
              <template slot-scope="{ row }" class="unit-quantity" v-if="row.grade === 4 && row.itemType == 2">
                <div class="df" v-if="dialogType === 2">
                  <div class="el-input el-input--mini wh-80" :class="{ 'is-disabled': row.isQuote === 1 || row.isQuote === 3 || orgType === 4 || row.isChooseByArea === 1 }">
                    <input v-model.trim="row.unitQuantity" class=" el-input__inner" @change="quantityChange($event, row)" :disabled="row.isQuote === 1 || row.isQuote === 3 || orgType === 4 || row.isChooseByArea === 1" @input="row.unitQuantity = $limitInputNumber(row.unitQuantity, 99999999.999999, null, 6)" @blur="row.unitQuantity = row.unitQuantity - 0" />
                    <!-- oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,6})?).*$/g, '$1')"
                    @blur="row.unitQuantity = $event.target.value" -->
                  </div>
                  <div>{{ row.numberUnit }}</div>
                  <!-- <el-select v-model="row.fkUnitId" @change="unitChange(row)" v-if="row.grade === 4" size="mini"
                  class="wh-80"
                  :disabled="row.isQuote === 1 || row.isQuote === 3 || orgType === 4 || row.isChooseByArea === 1">
                  <el-option v-for="item in unitOptions" :key="item.pkId" :value="item.pkId"
                    :label="item.unitName"></el-option>
                </el-select> -->
                </div>
                <!-- <span v-if="dialogType === 1">{{ row.unitQuantity + row.numberUnit + '/' + row.unitName }}</span> -->
                <span v-if="dialogType === 1">{{ row.unitQuantity + row.numberUnit }}</span>
              </template>
            </pl-table-column>
            <!-- align="center" -->
            <pl-table-column label="设计工程量" width="150">
              <template slot-scope="{ row }">
                <div v-if="row.grade === 4 && dialogType === 2" class="el-input el-input--mini" :class="{ 'is-disabled': row.itemType == 2 || row.isQuote === 1 || row.isQuote === 3 || orgType === 4 || row.isChooseByArea === 1 }">
                  <input class="el-input__inner" v-model.trim="row.designQuantities" @change="designChange(row)" :disabled="row.itemType == 2 || row.isQuote === 1 || row.isQuote === 3 || orgType === 4 || row.isChooseByArea === 1" @input="row.designQuantities = $limitInputNumber(row.designQuantities, 99999999.999999, null, 6)" @blur="row.designQuantities = row.designQuantities - 0" />
                  <!-- oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,6})?).*$/g, '$1')"
                  @blur="row.designQuantities = $event.target.value" -->
                  <!-- <span>{{
                  (row.designQuantities =
                    row.itemType !== 2
                      ? 1 * row.unitQuantity
                      : row.unitQuantity * row.number)
                }}</span> -->
                </div>
                <span v-if="row.grade === 4 && dialogType === 1">{{ row.designQuantities }}</span>
              </template>
            </pl-table-column>
            <!-- align="center" -->
            <pl-table-column label="单位" prop="numberUnit" width="150"> </pl-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </pl-table>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" class="el-button-primary" @click="handleEdit" v-show="dialogType === 1 && !setShow" v-has="'production:setting:itemDetailedEdit'">修 改</el-button>
        <el-button type="warning" class="print" @click="print" v-show="dialogType === 1 && !setShow" v-has="'production:setting:itemDetailedOut'">打 印</el-button>
        <el-button type="primary" class="export" @click="exportss" v-show="dialogType === 1 && !setShow" v-has="'production:setting:itemDetailedPut'">导 出</el-button>
        <el-button type="primary" class="el-button-primary" @click="openItemListDialog" v-show="dialogType === 1 && setShow" v-has="'production:setting:itemDetailedEdit'">设置分项清单细目</el-button>
        <el-button type="primary" class="el-button-primary" @click="handleSave" v-show="dialogType === 2">保 存</el-button>
        <el-button type="primary" plain @click="handleClose2" v-show="dialogType === 2">取 消</el-button>
        <!-- <el-button type="primary" plain @click="handleClose(2)" v-if="dialogType === 1">取 消</el-button> -->
      </span>
    </el-dialog>
    <!-- 设置分项表弹框 -->
    <el-dialog title="选择分项工程清单细目" :visible="itemListDialog" @close="handleCloseItemListDialog(1)" v-loading="loading3" center width="40%" v-dialogDrag :close-on-click-modal="false">
      <div class="itemDialog dialog-form">
        <!-- <div class="header">请选择清单</div> -->
        <!-- <div class="main"> -->
        <!-- :expand-on-click-node="false" @check-change="checkNode" check-on-click-node-->
        <virtualNodeTree class="main" default-expand-all :data="checkList" :props="defaultProps" ref="checkList" v-if="itemListDialog" :expand-on-click-node="false">
          <span slot-scope="{ node, data }">
            <el-tooltip effect="dark" :content="node.label" placement="bottom-start" :disabled="isShowTooltip">
              <div :class="'label' + data.grade" @mouseenter="onMouseEnter(`label${data.grade + String(node.id)}`)">
                <span :ref="'label' + data.grade + String(node.id)" @click="nodeClick(data, node)" :class="{ blue: data.pkId.indexOf('add') !== -1 }">
                  <i class="add el-icon-plus" v-if="data.pkId.indexOf('add') !== -1"></i>
                  {{ node.label + (data.grade === 4 && data.childList.filter(item => item.systemType).length ? "(自定义)" : "") }}
                </span>
                <!-- <span :ref="'label' + data.grade + String(node.id)" @click="nodeClick(data, node)"
                  :class="{ blue: data.detailTypeStatus && ![1, 3].includes(node.parent.data.isQuote) && node.parent.data.isChooseByArea !== 1 }">{{
                    node.label + (!!data.detailTypeStatus && !!data.checkStatus && ![1,
                      3].includes(node.parent.data.isQuote) &&
                      node.parent.data.isChooseByArea !== 1 ? "(待选)" :
                      data.grade == 5 && data.sysItemDetailName !== data.itemName ? "(" + data.sysItemDetailName + ")" :
                        data.grade === 4 &&
                          data.childList.filter(item => item.systemType).length ? '(自定义)' : "") }}</span>
                <i class="el-icon-s-tools" v-if="data.customStatus == 1" @click.stop="custom(data)"></i> -->
              </div>
            </el-tooltip>
          </span>
        </virtualNodeTree>
        <!-- </div> -->
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" class="el-button-primary" @click="handleSaveLinkList">下一步</el-button>
      </span>
    </el-dialog>
    <el-dialog title="设置分项工程清单" width="30%" center :visible="setMaterialDialog" @close="closeSetMaterialDialog" v-dialogDrag :close-on-click-modal="false">
      <div class="setMaterialDialog dialog-form" ref="setMaterialDialog">
        <el-checkbox-group v-model="selectList" @change="checkboxChange">
          <el-checkbox v-for="item in showMaterialList" :label="item.pkId" :key="item.pkId">{{ item.detailName }}</el-checkbox>
        </el-checkbox-group>
      </div>
      <div slot="footer">
        <el-button type="primary" class="el-button-primary" @click="setMaterialDialogOk">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="自定义清单" width="30%" center :visible="customShow" @close="closeCustom" v-dialogDrag :close-on-click-modal="false">
      <div class="setMaterialDialog dialog-form" ref="setMaterialDialog">
        <el-tree :data="customData" ref="tree" :default-expand-all="true" show-checkbox node-key="pkId" :props="customProps"> </el-tree>
      </div>
      <div slot="footer">
        <el-button type="primary" @click="customPreserve">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SearchBar from "./SearchBar.vue";
import { extractTree } from "@/utils/commond";
import virtualNodeTree from "../../../components/virtualNodeTree/tree.vue";
import lodash from "lodash";
import printJs from "print-js";
import utils from "@/utils/util";
export default {
  components: { SearchBar, virtualNodeTree },
  props: {
    ListDialog: {
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
      radio: 1,
      loading: false,
      randomKey: Math.random(),
      tableDate: [],
      cloneTableDate: [],
      checkList: [],
      cloneCheckList: [],
      sendList: [],
      selectList: [],
      defaultProps: {
        label: "itemName",
        children: "childList"
      },
      defaultProps2: {
        children: "children",
        hasChildren: "hasChildren"
      },
      itemListDialog: false,
      unitOptions: [],
      loading2: false,
      isShowTooltip: true,
      setProMa: false,
      timer: null,
      loading3: false,
      isChange: false,
      setMaterialDialog: false,
      materialList: [],
      showMaterialList: [],
      nowClickNode: {},
      itemType: "",
      parentId: "",
      isChange1: false,
      isChange2: false,
      rowIndex: "",
      tableTree: [],
      addIndex: 0,
      isExpand: false,
      gradePkId: "",
      customData: [],
      arr1: [],
      arr2: [],
      customShow: false,
      customProps: {
        label: "detailName",
        children: "childList"
      },
      customRawData: {},
      setShow: false,
      timers: null,
      getTreeData: {
        customDetailClassVoList: [],
        baseDetailClassVoList: []
      }
    };
  },
  methods: {
    print() {
      this.loading = true;
      this.$api
        .printPDFprodItem({ fkOrgId: this.fkOrgId })
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
        .exportprodItem({ fkOrgId: this.fkOrgId })
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
    closeCustom() {
      this.customShow = false;
    },
    custom(data) {
      this.loading3 = true;
      this.customRawData = data;
      console.log(this.cloneTableDate);
      console.log(data);
      this.parentId = data.pkId;
      this.arr2 = [];
      data.childList.forEach(item => {
        item.childList.forEach(e => {
          this.arr2.push(e.pkId);
        });
      });
      this.$api.searchCustomDetail({ itemId: data.pkId }).then(res => {
        if (res.code == 200) {
          this.loading3 = false;
          res.data.forEach(item => {
            item.detailName = item.className;
            item.fkDetailClassId = null;
          });
          this.customData = res.data;
          this.customShow = true;
        } else {
          this.loading3 = false;
          this.$message.warning(res.msg);
        }
      });
    },
    customPreserve() {
      let nodes = this.$refs.tree.getCheckedNodes(false, true).filter(item => item.pkId != "1" && item.pkId != "2");
      let arr1 = JSON.parse(JSON.stringify(nodes));
      let arr2 = [];
      let addArr = [];
      arr1.forEach(item => {
        item.fkParentId = item.fkDetailClassId;
        item.itemName = item.detailName;
        if (item.fkDetailClassId == null) {
          item.childList = [];
          arr2.push(item);
        }
      });
      arr2.forEach(item => {
        arr1.forEach(e => {
          if (item.pkId == e.fkDetailClassId) {
            item.childList.push(e);
          }
        });
      });
      console.log("arr2", arr2);
      // arr2.forEach(item => {
      //   this.customRawData.childList.push(item)
      // })

      let addObj = this.customRawData.childList.filter(item => item.pkId.indexOf("add") != -1)[0];
      this.customRawData.childList = [...arr2.map(item => ({ ...item, childList: item.childList.map(item2 => ({ ...item2, fkSysItemDetailId: item2.pkId })) })), addObj];
      this.customRawData.childList = this.arrayUnique(this.customRawData.childList, "pkId");
      // console.log('啊？',this.customRawData);
      // let addArr = arr2.map(item => ({ grade: 4, fkParentId: this.parentId, itemName: item.detailName, fkSysItemDetailId: item.pkId, itemType: this.itemType, fkDetailClassId: this.nowClickNode.pkId, numberUnit: item.unitName, unitQuantity: "", fkUnitId: "", fkNumberUnitId: item.fkUnitId }));
      let index = this.cloneTableDate.findIndex(item => item.pkId === this.parentId);
      let arr3 = this.cloneTableDate
        .filter(item => {
          if (item.fkParentId === this.parentId && this.parentId === this.nowClickNode.pkId) {
          } else {
            return item;
          }
        })
        .map(item => ({ ...item }));
      let arr4 = this.cloneTableDate.filter(item => item.fkParentId === this.parentId);
      let hasId = arr4.map(item => item.fkSysItemDetailId);
      arr2.forEach(item => {
        item.childList.forEach(item2 => {
          if (!hasId.includes(item2.pkId)) {
            addArr.push({ ...item2, grade: 4, parentId: this.parentId, fkSysItemDetailId: item2.pkId, fkParentId: this.parentId, fkNumberUnitId: item2.fkUnitId, numberUnit: item2.unitName, itemType: this.nowClickNode.itemType });
          } else {
            addArr.push({ ...item2, grade: 4, parentId: this.parentId, fkSysItemDetailId: item2.pkId, fkParentId: this.parentId, fkNumberUnitId: item2.fkUnitId, numberUnit: item2.unitName, itemType: this.nowClickNode.itemType });
          }
        });
      });
      console.log(addArr);
      arr3.splice(
        index + 1,
        0,
        ...addArr.map((item, index) => {
          let obj = arr4.filter(item2 => item2.fkSysItemDetailId === item.fkSysItemDetailId);
          console.log("aaaaaa", obj, obj.length ? obj[0].myId : this.addIndex + 1);
          this.addIndex += 1;
          return { ...item, pkId: obj.length ? obj[0].pkId : "", designQuantities: obj.length ? obj[0].designQuantities : "", myId: obj.length ? obj[0].myId : this.addIndex };
        })
      );
      this.isChange2 = true;
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
        if (item.fkParentId === myId) {
          item.children = this.listToTree(list, item.pkId);
          children.push(item);
        }
      });
      return children;
    },
    // 获取分项工程表
    getInventory() {
      this.loading2 = true;
      this.$api.getInventory({ fkOrgId: this.fkOrgId }).then(res => {
        if (res.code === 200) {
          let arr = res.data.map((item, index) => ({ ...item, myId: index + 1 }));
          this.addIndex = res.data.length;
          this.tableDate = arr;
          let tree = this.listToTree(arr, "0");
          this.tableTree = tree;
          this.$refs.tables1.$children[0].reloadData(this.tableTree);
          if (arr.filter(item => item.grade === 4).length) {
            this.setShow = false;
          } else {
            this.setShow = true;
          }
        } else {
          this.$message.warning(res.msg);
        }
        this.loading2 = false;
      });
    },
    // 获取细目树形
    getDetailTree() {
      this.loading2 = true;
      this.$api.getDetailTree({ fkOrgId: this.fkOrgId }).then(res => {
        if (res.code === 200) {
          res.data.forEach(item => {
            item.childList.forEach(item2 => {
              item2.childList.forEach(item3 => {
                item3.childList.push({ pkId: "add" + item3.pkId, itemName: "选择清单" });
              });
            });
          });
          this.checkList = res.data;
          this.cloneCheckList = lodash.cloneDeep(res.data);
        } else {
          this.$message.warning(res.msg);
        }
        this.loading2 = false;
      });
    },
    getDetailed() {
      let data = {};
      if (this.user.orgType != 5) {
        data.fkOrgId = this.fkOrgId;
      }
      this.$api.getDetailed(data).then(res => {
        console.log(res);
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
    //     .searchItems({ isLevel: 5, fkOrgId: this.fkOrgId })
    //     .then(res => {
    //       if (res.code === 200) {
    //         if (res.data && res.data.length) {
    //           this.setProMa = !!res.data.filter(item => item.isQuote === 3).length;
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
    //               prodItemLists: item3.detailTables
    //                 ? item3.detailTables.map((item4, index4) => ({
    //                     ...item4,
    //                     myId: [index, index2, index3, index4].join("-"),
    //                     pid: [index, index2, index3].join("-")
    //                   }))
    //                 : [],
    //               detailTables: item3.detailTables
    //                 ? item3.detailTables.map((item4, index4) => ({
    //                     ...item4,
    //                     myId: [index, index2, index3, index4].join("-"),
    //                     pid: [index, index2, index3].join("-")
    //                   }))
    //                 : []
    //             }))
    //           }))
    //         }));
    //         const arr = this.checkList.map((item, index) => ({
    //           ...item,
    //           prodItemLists: item.prodItemLists.map(item2 => ({
    //             ...item2,
    //             prodItemLists: item2.prodItemLists.map(item3 => ({
    //               ...item3,
    //               prodItemLists: item3.prodItemLists
    //                 ? item3.prodItemLists
    //                     .filter(item4 => item4.pkId)
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
    // 获取所有单位
    getAllUnit() {
      this.$api.conditionUnits({ unitType: 0 }).then(res => {
        if (res.code === 200) {
          this.unitOptions = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 把树形数据转为扁平数据
    treeToArr(list) {
      return extractTree(list, "prodItemLists", ["designQuantities", "fkNumberUnitId", "fkProjectId", "fkSysItemDetailId", "fkSysItemId", "fkSysParentId", "fkUnitId", "fkWorkflowId", "grade", "itemCode", "itemName", "itemType", "number", "numberUnit", "pkId", "prodItemListAdds", "reItemMaterials", "sortval", "unitName", "unitQuantity", "parentId", "index", "faIndex", "fkWorkflowTemplateId", "detailTables", "pid", "myId", "materials", "fkParentId", "isChoose", "fkUnitName", "reItemDrawings", "workflowName", "isQuote", "isChooseByArea"]);
    },
    // 保存清单表
    handleSave() {
      // .filter(item => item.grade === 4);
      this.loading = true;
      this.rowIndex = "";
      const checkList = this.tableDate;
      const checkList2 = this.tableDate.filter(item => item.grade === 4);
      for (let i = 0; i < checkList.length; i++) {
        for (let j = 1; j < checkList.length; j++) {
          if (checkList[i].grade === 4 && checkList[j].grade === 4) {
            // if(![1,3].includes(checkList[i].isQuote)&&checkList[i].isChooseByArea !== 1&&![1,3].includes(checkList[j].isQuote)&&checkList[j].isChooseByArea !== 1){
            if (checkList[i].fkSysItemDetailId === checkList[j].fkSysItemDetailId) {
              if (checkList[i].itemName !== checkList[j].itemName) {
                console.log(checkList[i].itemName, checkList[j].itemName);
                this.rowIndex = checkList[j].myId;
                this.loading = false;
                return this.$message.warning(`问题名称 ${checkList[j].itemName},同一个清单项目名称必须相同`);
              }
            } else {
              // if (checkList[i].itemName === checkList[j].itemName) {
              //   this.rowIndex = j
              //   this.loading=false
              //   return this.$message.warning(`问题名称 ${checkList[j].itemName},不同清单项目名称不能相同`);
              // }
            }
            // }
          }
        }
        if (checkList[i].grade === 4 && (checkList[i].designQuantities == 0 || checkList[i].designQuantities < 0)) {
          console.log(checkList[i].designQuantities);
          this.rowIndex = checkList[i].myId;
          this.loading = false;
          return this.$message.warning(`${checkList[i].itemName}设计工程量不能为0`);
        }
      }
      // const arr = listToTree(this.tableDate, 0);

      const arr = checkList2.map(item => ({
        designQuantities: item.designQuantities - 0,
        fkItemId: item.fkParentId,
        fkUnitId: item.fkUnitId ? item.fkUnitId : item.fkNumberUnitId,
        fkSysItemDetailId: item.fkSysItemDetailId,
        itemName: item.itemName,
        unitQuantity: item.unitQuantity,
        fkNumberUnitId: item.fkNumberUnitId
      }));
      this.loading = false;
      this.loading = true;
      this.$api
        .addAndUpdateDetail(arr)
        .then(res => {
          if (res.code === 200) {
            this.$message.success("编辑成功");
            // this.handleClose(2);
            this.dialogType = 1;
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
            this.$emit("update:ListDialog", false);
            this.isChange = false;
            this.dialogType = 1;
          });
        } else {
          this.$emit("update:ListDialog", false);
          this.isChange = false;
          this.dialogType = 1;
        }
      } else {
        this.$emit("update:ListDialog", false);
        this.isChange = false;
      }
      this.rowIndex = "";
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
          this.getInventory();
          this.getDetailTree();
          this.dialogType = 1;
          this.isChange = false;
        });
      } else {
        this.setShow = false;
        this.isChange = false;
        this.dialogType = 1;
      }
      this.rowIndex = "";
    },
    // 打开分项表设置弹框
    openItemListDialog() {
      this.loading3 = true;
      this.cloneTableDate = this.tableDate.map(item => ({ ...item }));
      this.itemListDialog = true;
      setTimeout(() => {
        this.loading3 = false;
      }, 1500);
    },
    // 关闭分项表设置弹框
    handleCloseItemListDialog(type) {
      if (type === 1) {
        if (this.isChange2) {
          this.$confirm("是否取消，取消后新增加的数据将不保存", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(() => {
            this.itemListDialog = false;
            this.checkList = lodash.cloneDeep(this.cloneCheckList);
            this.isChange2 = false;
          });
        } else {
          this.itemListDialog = false;
          // this.checkList = lodash.cloneDeep(this.cloneCheckList);
          this.isChange2 = false;
        }
      } else {
        this.itemListDialog = false;
        this.checkList = lodash.cloneDeep(this.cloneCheckList);
        this.isChange2 = false;
      }
    },
    // 保存分项表
    handleSaveLinkList() {
      this.isChange = true;
      this.dialogType = 2;
      console.log(this.cloneTableDate);
      this.tableDate = this.cloneTableDate.map(item => ({ ...item }));
      let tree = this.listToTree(this.tableDate, "0");
      this.tableTree = tree;
      this.$refs.tables1.$children[0].reloadData(this.tableTree);
      this.cloneCheckList = lodash.cloneDeep(this.checkList);
      this.randomKey = Math.random();
      this.isExpand = false;
      this.handleCloseItemListDialog(2);
      if (this.tableDate.filter(item => item.grade === 4).length) {
        this.setShow = false;
      } else {
        this.setShow = true;
      }
    },
    keyDown(e) {
      const key = e.key;
      if (key === "e" || key === "-" || key === "+") {
        e.returnValue = false;
        return false;
      }
      return true;
    },
    // 禁用树形复选框
    treeDisabled(data, node) {
      if ((data.isQuote && data.isQuote !== 0) || data.isChooseByArea === 1) {
        return true;
      }
      return false;
    },
    // 单位选中变化时的函数
    unitChange(row) {
      this.isChange = true;
      const arr = this.unitOptions.filter(item => item.pkId === row.fkUnitId);
      row.unitName = arr[0].unitName;
      this.tableDate.forEach(item => {
        if (item.myId == row.myId) {
          item.fkUnitId = row.fkUnitId;
          item.unitName = row.unitName;
        }
      });
      this.$refs.tables1.$children[0]._data.plTreeData.forEach(item => {
        if (item.myId == row.myId) {
          item.fkUnitId = row.fkUnitId;
          item.unitName = row.unitName;
        }
      });
    },
    // 隧道每延米工程量改变事件
    quantityChange(e, row) {
      // let val = e;
      // val = val.replace(/[^\d.]/g, ""); //清除"数字"和"."以外的字符
      // val = val.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
      // val = val.replace(/^0+\./g, "0.");
      // val = val.match(/^0+[1-9]+/) ? (val = val.replace(/^0+/g, "")) : val;
      // val = val.match(/^\d*(\.?\d{0,6})/g)[0] || "";
      // row.unitQuantity = val;
      this.isChange = true;
      // clearTimeout(this.timer);
      // this.timer = setTimeout(() => {
      const obj = this.tableDate.filter(item => item.pkId == row.fkParentId)[0];
      row.designQuantities = (row.unitQuantity * obj.number).toFixed(6) - 0;
      this.tableDate.forEach(item => {
        if (item.myId == row.myId) {
          item.unitQuantity = row.unitQuantity;
          item.designQuantities = row.designQuantities;
        }
      });
      this.$refs.tables1.$children[0]._data.plTreeData.forEach(item => {
        if (item.myId == row.myId) {
          item.unitQuantity = row.unitQuantity;
          item.designQuantities = row.designQuantities;
        }
      });
      // }, 200)
    },
    // 同类型清单改一个全部都改
    itemNameChange(e, row, index) {
      console.log(index);
      let resh = false;
      let arr = this.$refs.tables1.getTreeExpandRecords();
      let scrollTop = this.$refs.tables1.$children[0].scrollTop;
      clearTimeout(this.timer);
      this.isChange = true;
      // this.timer = setTimeout(() => {
      // this.$set(row,'itemName','')
      // this.$set(row,'itemName',e.target.value)
      this.tableDate.forEach(item => {
        if (item.grade === 4 && item.fkSysItemDetailId === row.fkSysItemDetailId) {
          if (item.itemName !== row.itemName) {
            resh = true;
          }
          // if(item.isQuote === 1 || item.isQuote === 3 || item.isChooseByArea === 1){

          // }else{
          //   }
          item.itemName = row.itemName;
        }
      });
      if (resh) {
        this.checkList.forEach(item => {
          item.childList.forEach(item2 => {
            item2.childList.forEach(item3 => {
              item3.childList.forEach(item4 => {
                item4.childList &&
                  item4.childList.forEach(item5 => {
                    if (row.fkSysItemDetailId == item5.fkSysItemDetailId) {
                      item5.itemName = row.itemName;
                    }
                  });
              });
            });
          });
        });
        console.log(arr);
        this.randomKey = Math.random();
        this.$nextTick(() => {
          arr.forEach(item => this.$refs.tables1.setTreeExpansion(item, true));
          this.$nextTick(() => {
            this.$refs.tables1.$children[0].bodyWrapper.scrollTo(0, scrollTop);
          });
        });
      }
      // this.$refs.tables1.plTreeData=this.tableTree
      // this.$refs.tables1.data=this.$set(this.$refs.tables1,'data',this.tableTree)
      // console.log(this.tableTree,this.tableDate,this.$refs.tables1.$children[0],this.$refs.tables1);
      // })
      // this.$refs.tables1.$children[0]._data.plTreeData.forEach(item=>{
      //   if (item.grade === 4 && item.fkSysItemDetailId === row.fkSysItemDetailId) {
      //     item.itemName = row.itemName;
      //     console.log(item.itemName);
      //   }
      // })
      // this.$refs.tables1.$children[0].plTreeInit()
      // }, 300);
    },
    // 树形超过宽度提示
    onMouseEnter(str) {
      const tag = this.$refs[str];
      const parentWidth = tag.parentNode.offsetWidth; // 获取元素父级可视宽度
      const contentWidth = tag.offsetWidth; // 获取元素可视宽度
      this.isShowTooltip = contentWidth <= parentWidth;
    },
    // 设计工程量输入框
    inputDes(e, row) {
      let val = e;
      val = val.replace(/[^\d.]/g, ""); // 清除"数字"和"."以外的字符
      val = val.replace(/\.{2,}/g, "."); // 只保留第一个. 清除多余的
      val = val.replace(/^0+\./g, "0.");
      val = val.match(/^0+[1-9]+/) ? (val = val.replace(/^0+/g, "")) : val;
      val = val.match(/^\d*(\.?\d{0,6})/g)[0] || "";
      row.designQuantities = val;
    },
    designChange(row) {
      this.isChange = true;
      // clearTimeout(this.timer);
      // this.timer = setTimeout(() => {
      this.tableDate.forEach(item => {
        if (item.myId == row.myId) {
          item.designQuantities = row.designQuantities;
        }
      });
      this.$refs.tables1.$children[0]._data.plTreeData.forEach(item => {
        if (item.myId == row.myId) {
          item.designQuantities = row.designQuantities;
        }
      });
      // },100)
    },
    // nodeClick(data, node) {
    //   if (data.grade == 3) {
    //     this.gradePkId = data.pkId
    //   } else {
    //     this.gradePkId = data.fkItemId
    //   }
    //   if (data.detailTypeStatus === 1) {
    //     if (node.parent.data.isQuote === 1 || node.parent.data.isQuote === 3 || node.parent.data.isChooseByArea === 1) {
    //       return
    //     }
    //     console.log(data, node);
    //     this.nowClickNode = data;
    //     this.parentId = node.parent.data.pkId;
    //     this.itemType = node.parent.data.itemType;
    //     this.selectList = data.childList.map(item => item.fkSysItemDetailId);
    //     let arr = this.materialList.filter(item => item.pkId === data.pkId);
    //     this.showMaterialList = arr.length ? arr[0].childList : [];
    //     this.setMaterialDialog = true;
    //     this.$nextTick(() => {
    //       this.$refs.setMaterialDialog.scrollTo(0, 0);
    //     });
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
      parentObj.childList.forEach(item => {
        if (item.pkId.indexOf("add") == -1) {
          item.childList.forEach(item2 => {
            arr.push(item2.fkSysItemDetailId);
          });
        }
      });
      this.selectList = arr;
      console.log(arr);
      this.$api.getAvailableDetailClass({ itemId: parentObj.pkId }).then(res => {
        if (res.code == 200) {
          console.log("获取的", res.data);
          res.data.baseDetailClassVoList.forEach(item => {
            item.detailName = item.className;
            item.fkDetailClassId = null;
          });
          res.data.customDetailClassVoList.forEach(item => {
            item.detailName = item.className;
            item.fkDetailClassId = null;
          });
          this.getTreeData = res.data;
          if (res.data.customDetailClassVoList.length) {
            this.customData = [
              { detailName: "系统清单", pkId: "1", childList: res.data.baseDetailClassVoList },
              { detailName: "自定义清单", pkId: "2", childList: res.data.customDetailClassVoList }
            ];
          } else {
            this.customData = res.data.baseDetailClassVoList;
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
    setMaterialDialogOk() {
      let arr = this.selectList.length ? this.showMaterialList.filter(item => this.selectList.includes(item.pkId)) : [];
      this.nowClickNode.checkStatus = arr.length ? 0 : 1;
      this.$set(
        this.nowClickNode,
        "childList",
        arr.map(item => ({ ...item, itemName: item.detailName, fkSysItemDetailId: item.pkId }))
      );
      let addArr = arr.map(item => ({ grade: 4, fkParentId: this.parentId, itemName: item.detailName, fkSysItemDetailId: item.pkId, itemType: this.itemType, fkDetailClassId: this.nowClickNode.pkId, numberUnit: item.unitName, unitQuantity: "", fkUnitId: "", fkNumberUnitId: item.fkUnitId }));
      let index = this.cloneTableDate.findIndex(item => item.pkId === this.parentId);
      let arr3 = this.cloneTableDate
        .filter(item => {
          if (item.fkParentId === this.parentId && item.fkDetailClassId === this.nowClickNode.pkId) {
          } else {
            return item;
          }
        })
        .map(item => ({ ...item }));
      let arr4 = this.cloneTableDate.filter(item => item.fkParentId === this.parentId);
      arr3.splice(
        index + 1,
        0,
        ...addArr.map((item, index) => {
          let obj = arr4.filter(item2 => item2.fkSysItemDetailId === item.fkSysItemDetailId);
          console.log(obj.length ? obj[0].myId : this.addIndex + 1);
          this.addIndex += 1;
          return { ...item, designQuantities: obj.length ? obj[0].designQuantities : "", myId: obj.length ? obj[0].myId : this.addIndex };
        })
      );
      this.isChange2 = true;
      this.cloneTableDate = arr3;
      console.log("看", this.cloneTableDate);
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
    // 选中添加样式
    selectRowStyle({ row, rowIndex }) {
      if (row.myId == this.rowIndex) {
        return { "background-color": "#ffff00" };
      }
    },
    handleEdit() {
      this.dialogType = 2;
    },
    expandChange() {
      console.log(1);
      // this.randomKey = Math.random()
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
      console.log(arr);
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
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "[]");
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
      console.log("展示的", arr, this.tableTree, this.cloneTableDate);
      return arr;
    }
  },
  watch: {
    ListDialog(val) {
      if (val) {
        // this.getItemList();
        this.getInventory(); // 获取table数据
        this.getDetailTree(); // 获取细目树形
        this.getDetailed();
        this.getAllUnit();
        this.$nextTick(() => {
          console.log(this.$refs.tables1.data);
        });
      } else {
        this.clearTimer();
        this.tableDate = [];
        this.tableTree = [];
        this.radio = 1;
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
// .tables {
//   height: 500px;
// }
.table-data {
  padding: 0;
  /deep/ .el-icon-arrow-right:before {
    content: "\e791";
    font-size: 16px;
  }
}
.itemDialog {
  // width: 100%;
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
    overflow: hidden;
    /*超出部分隐藏*/
    white-space: nowrap;
    /*禁⽌换⾏*/
    text-overflow: ellipsis;
    /*省略号*/
  }

  .label2 {
    width: 480px;
    overflow: hidden;
    /*超出部分隐藏*/
    white-space: nowrap;
    /*禁⽌换⾏*/
    text-overflow: ellipsis;
    /*省略号*/
  }

  .label3 {
    width: 470px;
    overflow: hidden;
    /*超出部分隐藏*/
    white-space: nowrap;
    /*禁⽌换⾏*/
    text-overflow: ellipsis;
    /*省略号*/
  }

  .label4 {
    width: 460px;
    overflow: hidden;
    /*超出部分隐藏*/
    white-space: nowrap;
    /*禁⽌换⾏*/
    text-overflow: ellipsis;
    /*省略号*/
  }
}

.el-radio-group {
  margin-top: 30px;
  margin-left: -20px;
}

.wh-50 {
  width: 50px;
}

.df {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
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
.add {
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  // vertical-align: middle;
  border-radius: 50%;
  color: #02a7f0;
  border: 1px solid #02a7f0;
}
// /deep/ .el-tree {
//     width: 100%;
//     height: 500px;
//     overflow: auto;
//     // 不可全选样式
//     .el-tree-node {
//       .is-leaf + .el-checkbox .el-checkbox__inner {
//         display: inline-block;
//       }
//       .el-checkbox .el-checkbox__inner {
//         display: none;
//       }
//     }
// }
</style>
