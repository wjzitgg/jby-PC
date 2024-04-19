<template>
  <div>
    <el-dialog :close-on-press-escape="false" v-if="proManDialog" title="单位分部分项表" :visible="proManDialog" @close="handleClose(1)" width="80%" center v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form">
        <SearchBar v-if="dialogType === 2">
          <template slot="right">
            <el-button type="primary" class="el-button-primary" size="mini" @click="openItemListDialog">设置分项表</el-button>
            <!--   -->
          </template>
        </SearchBar>
        <div class="protable table-data">
          <el-table :data="treeDate" height="100%" :key="randomKey" v-loading="loading3" @expand-change="expandChange" :tree-props="{ children: 'prodItemLists' }" row-key="myId" ref="tables1" :header-cell-style="{ background: '#f1f6ff' }">
            <!-- <el-table-column align="center" label="序号" type="index" width="80"></el-table-column> -->
            <!-- align="center" -->
            <el-table-column>
              <template slot="header" slot-scope="scope" :cleanRed="scope">
                <i class="el-icon-s-operation" style="color:#1295d9;cursor: pointer;" @click="handleExpand('tables1', 'isExpand', 'treeDate')"></i>
                <span>项目编号</span>
              </template>
              <template slot-scope="{ row }">
                <el-input size="mini" v-if="dialogType === 2" class="wh-80per" v-model="row.itemCode" :disabled="row.isQuote === 1 || row.isQuote === 3 || orgType === 4 || row.isChooseByArea === 1" @focus="openChangeItemCodeDialog(row)"></el-input>
                <span v-if="dialogType === 1">{{ row.itemCode }}</span>
              </template>
            </el-table-column>
            <!-- align="center" -->
            <el-table-column label="项目名称【专业类别】">
              <template slot-scope="{ row }">
                <el-input size="mini" v-if="dialogType === 2" :value="row.itemName" :disabled="row.isQuote === 1 || row.isQuote === 3 || orgType === 4 || row.isChooseByArea === 1" @focus="openChangeItemNameDialog(row)">
                  <template slot="append" v-if="row.grade == 1">{{ row.professionalName }}</template>
                </el-input>
                <span v-if="dialogType === 1">{{ row.itemName + (row.grade == 1 ? ` 【${row.professionalName}】` : "") }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态">
              <template slot-scope="{ row }">
                <!--  approvalStatus   （未开始：0，审批中：1，已开始：2，已完成：3） -->
                <span v-if="row.grade == 3">{{ !!row.approvalStatus || row.approvalStatus === 0 ? ["未开始", "审批中", "已开始", "已完成"][row.approvalStatus] : "" }}</span>
              </template>
            </el-table-column>
            <!-- align="center" -->
            <el-table-column label="隧道延长米" width="180">
              <template slot-scope="{ row }">
                <div v-if="row.grade === 3 && row.itemType == 2">
                  <span>{{ row.number }}</span>
                  {{ row.unitName ? row.unitName : "" }}
                </div>
              </template>
            </el-table-column>
            <!-- <el-table-column label="设计产值" width="180">
            <template slot-scope="{ row }">
              <div v-if="row.grade === 3 && row.itemType == 3">
                <el-input v-if="dialogType === 2" size="mini" v-model="row.designQuantities" @input="temInput($event, row)" class="tac" oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')" @blur="row.designQuantities = $event.target.value" :disabled="row.isQuote === 1 || row.isQuote === 3 || orgType === 4 || row.isChooseByArea === 1"></el-input>
                <span v-if="dialogType === 1">{{ row.itemName }}</span>
              </div>
            </template>
          </el-table-column> -->
            <el-table-column align="center" label="工程控制流程" width="180">
              <template slot-scope="{ row }" v-if="!!row.workflowName">
                <a href="#" @click="inEstimate(row)" v-if="!row.handelType">{{ row.workflowName }}</a>
                <span v-else>处理中</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作" width="180">
              <template slot-scope="{ row }">
                <el-button type="text" @click="associationRules(row)" v-if="dialogType === 1 && row.grade === 3 && row.reItemDrawings && row.reItemDrawings.length">{{ dialogType === 1 ? "查看" : "" }}关联图纸</el-button>
                <el-button type="text" @click="associationRules(row)" v-if="row.grade === 3 && dialogType === 2 && [1, 3].includes(row.approvalStatus) && row.reItemDrawings && row.reItemDrawings.length">查看关联图纸</el-button>
                <el-button type="text" @click="handleOpenRelate(row)" v-if="(row.grade === 3 && dialogType === 2 && [0, 2].includes(row.approvalStatus)) || (row.grade === 3 && dialogType === 2 && !row.approvalStatus)">关联图纸</el-button>
              </template>
            </el-table-column>
            <div slot="empty" class="empty" style="width: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </el-table>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="handleClose2" v-show="dialogType === 2">取 消</el-button>
        <!-- <el-button type="primary" plain @click="handleClose(2)" v-show="dialogType === 1">取 消</el-button> -->
        <el-button type="primary" class="el-button-primary" @click="handleEdit" v-show="dialogType === 1 && treeDate.length" v-has="'production:setting:itemEdit'">修 改</el-button>
        <el-button type="warning" class="print" @click="print" v-show="dialogType === 1 && treeDate.length" v-has="'production:setting:itemPut'">打 印</el-button>
        <el-button type="primary" class="export" @click="exportss" v-show="dialogType === 1 && treeDate.length" v-has="'production:setting:itemOut'">导 出</el-button>
        <el-button type="primary" class="el-button-primary" @click="openItemListDialog" v-show="dialogType === 1 && setShow" v-has="'production:setting:itemEdit'">设置分项</el-button>
        <el-button type="primary" class="el-button-primary" @click="handleSave" v-show="dialogType === 2">保 存</el-button>
      </span>
    </el-dialog>

    <!-- 关联图纸模态框 -->
    <el-dialog title="关联图纸" :visible.sync="RelateDialog" @close="handleCloseRelateDialog" width="35%" center v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form">
        <el-form label-width="100px">
          <el-form-item label="分项工程分类">
            <el-input size="mini" disabled :value="detailName"></el-input>
          </el-form-item>
          <el-form-item label="关联图纸">
            <div class="over">
              <!-- 6193bug 把以前禁用逻辑去除 -->
              <div class="form-item-item" v-for="(item, index) in RelateList" :key="item.id">
                <el-select size="mini" class="wh-200" v-model="item.fkDrawingId" @change="drawChange" :disabled="dialogType === 1 || ![0, 2].includes(rowList.approvalStatus)">
                  <el-option v-for="draw in drawList" :key="draw.pkId" :value="draw.pkId" :label="draw.drawingName"></el-option>
                </el-select>
                <span><el-input size="mini" class="wh-50" v-model.trim="item.beginPage" type="number" @input="drawInp(item)" @blur="drawBlur(item, index)" :disabled="!item.fkDrawingId || dialogType === 1 || ![0, 2].includes(rowList.approvalStatus)" @keydown.native="keyDown2"></el-input>页 </span>
                <span>
                  至
                  <el-input size="mini" class="wh-50" v-model.trim="item.endPage" @input="drawInp(item)" @blur="drawBlur(item, index)" type="number" :disabled="!item.fkDrawingId || dialogType === 1 || ![0, 2].includes(rowList.approvalStatus)" @keydown.native="keyDown2"> </el-input>
                  页</span
                >
                <div class="icon add" @click="handleAddRelate(item.pkId)" v-if="dialogType === 2 && index == RelateList.length - 1 && orgType !== 4 && [0, 2].includes(rowList.approvalStatus)">
                  <i class="el-icon-plus"></i>
                </div>
                <span class="icon remove" @click="handleRemoveRelate(item.id)" v-if="dialogType === 2 && orgType !== 4 && [0, 2].includes(rowList.approvalStatus)"><i class="el-icon-minus"></i></span>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer" v-if="dialogType === 2">
        <el-button type="primary" class="el-button-primary" @click="handleSaveRelate">保 存</el-button>
        <el-button type="primary" plain @click="handleCloseRelateDialog">取 消</el-button>
      </span>
    </el-dialog>
    <!-- 流程图模态框 -->
    <el-dialog title="" :visible.sync="ProcessDialog" width="80%" center v-dialogDrag :close-on-click-modal="false">
      <div class="can-box dialog-form">
        <!-- <div class="pre-name">{{ preName }}</div>
        <div class="pre-can" ref="preCan" id="preCan"></div> -->
        <!-- <taskFinishList :list="list"></taskFinishList> -->
        <acceptanceProcess :editStatus="false" :workflowType="'1'" :accessType="'3'" ref="productionApproval4"></acceptanceProcess>
      </div>
    </el-dialog>
    <!-- 设置分配表模态框 -->
    <el-dialog title="设置分项表" :visible.sync="itemListDialog" @close="handleCloseItemListDialog" center width="70%" v-dialogDrag :close-on-click-modal="false" v-loading="loading4">
      <div class="dialog-form">
        <!-- 第一步 -->
        <div class="itemDialog" v-show="nodeLevel === 1">
          <div class="itemDialog-left">
            <div class="header">新增单位工程</div>
            <div class="main" v-loading="loading2">
              <div class="cellList">
                <div class="cellItem" v-for="item in cellList" :key="item.pkId">
                  <el-tooltip effect="dark" :content="item.itemName" placement="bottom-start" :disabled="item.itemName.length < 30">
                    <span class="label">{{ item.itemName }}</span>
                  </el-tooltip>
                  <i class="add el-icon-plus" @click="addNode(item)"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="itemDialog-middle"><i class="el-icon-right"></i></div>
          <div class="itemDialog-right">
            <div class="header hasSel">
              <div>已选择单位工程</div>
              <el-select v-model="treeFilter1" placeholder="请选择" size="mini">
                <el-option label="显示全部" value=""></el-option>
                <el-option label="显示已有数据" value="1"></el-option>
                <el-option label="显示新增数据" value="2"></el-option>
              </el-select>
            </div>
            <div class="main">
              <!--  @node-expand="nodeExpand" -->
              <el-tree :expand-on-click-node="false" :data="firstList" :props="defaultProps" ref="addTree1" node-key="myId" :filter-node-method="filterNode1">
                <span slot-scope="{ node, data }">
                  <div v-if="node.level === nodeLevel" class="psr">
                    <!-- @input="(val) => inp(val, data)" -->
                    <div class="showNode" :class="{ isNew: data.isNew }" :title="node.label">{{ node.label }}</div>
                    <!-- <el-input :class="{inputNew:data.isNew}" size="mini" :value="node.label" :disabled="data.isQuote === 1 || data.isQuote === 3 || data.isChooseByArea === 1"></el-input> -->
                    <div class="operate">
                      <!-- <img src="../../../assets/edit.svg" class="edit el-icon-edit" @click="openChangeItemNameDialog(data)" v-if="data.isQuote !== 1 && data.isQuote !== 3 && data.isChooseByArea !== 1" /> -->
                      <i class="edit el-icon-edit-outline" @click="openChangeItemNameDialog(data)" v-if="data.isQuote !== 1 && data.isQuote !== 3 && data.isChooseByArea !== 1"></i>
                      <i class="remove treeRemove el-icon-minus" @click="removeNode(data, node)" v-if="!!!data.isQuote"></i>
                    </div>
                  </div>
                  <el-tooltip effect="dark" :content="node.label" placement="bottom-start" :disabled="isShowTooltip" v-else>
                    <div :class="['label' + data.grade, { isNew: data.isNew }]" @mouseenter="onMouseEnter(`label${data.grade + String(node.id)}`)">
                      <span :ref="'label' + data.grade + String(node.id)">{{ node.label }}</span>
                    </div>
                  </el-tooltip>
                </span>
              </el-tree>
            </div>
          </div>
        </div>
        <!-- 第二步 -->
        <div class="itemDialog" v-show="nodeLevel === 2">
          <div class="itemDialog-left">
            <div class="header hasSel">
              <div>新增分部工程</div>
              <el-select v-model="treeFilter2" placeholder="请选择" size="mini">
                <el-option label="显示全部" value=""></el-option>
                <el-option label="显示已有数据" value="1"></el-option>
                <el-option label="显示新增数据" value="2"></el-option>
              </el-select>
            </div>
            <div class="main">
              <!--  @node-expand="nodeExpand" -->
              <el-tree :expand-on-click-node="false" :default-expanded-keys="expandedKeys" :data="firstList2" node-key="myId" :props="defaultProps" ref="tree" :filter-node-method="filterNode2">
                <span slot-scope="{ node, data }">
                  <el-tooltip effect="dark" :content="node.label" placement="bottom-start" :disabled="isShowTooltip">
                    <div v-if="node.level === nodeLevel" class="main-item">
                      <div :class="['label' + data.grade, { isNew: data.isNew }]" @mouseenter="onMouseEnter(`label${data.grade + String(node.id)}`)">
                        <span :ref="'label' + data.grade + String(node.id)">{{ node.label }}</span>
                      </div>
                      <i class="add el-icon-plus" @click="addNode(data, node)" v-if="data.isNew"></i>
                    </div>
                    <div v-else :class="['label' + data.grade, { isNew: data.isNew }]" @mouseenter="onMouseEnter(`label${data.grade + String(node.id)}`)">
                      <span :ref="'label' + data.grade + String(node.id)">{{ node.label }}</span>
                    </div>
                  </el-tooltip>
                </span>
              </el-tree>
            </div>
          </div>
          <div class="itemDialog-middle"><i class="el-icon-right"></i></div>
          <div class="itemDialog-right">
            <div class="header hasSel">
              <div>已选择单位分部工程</div>
              <el-select v-model="treeFilter3" placeholder="请选择" size="mini">
                <el-option label="显示全部" value=""></el-option>
                <el-option label="显示已有数据" value="1"></el-option>
                <el-option label="显示新增数据" value="2"></el-option>
              </el-select>
            </div>
            <div class="main">
              <!--  @node-expand="nodeExpand" -->
              <el-tree :expand-on-click-node="false" node-key="myId" default-expand-all :data="secondList" :props="defaultProps" ref="addTree2" :filter-node-method="filterNode3">
                <span slot-scope="{ node, data }">
                  <div v-if="node.level === nodeLevel" class="psr">
                    <!-- @input="(val) => inp(val, data)" -->
                    <div class="showNode" :class="{ isNew: data.isNew }" :title="node.label">{{ node.label }}</div>
                    <!-- <el-input size="mini" :class="{inputNew:data.isNew}" :value="node.label" :disabled="data.isQuote === 1 || data.isQuote === 3 || data.isChooseByArea === 1"></el-input> -->
                    <div class="operate">
                      <!-- <img src="../../../assets/edit.svg" class="edit el-icon-edit" @click="openChangeItemNameDialog(data)" v-if="data.isQuote !== 1 && data.isQuote !== 3 && data.isChooseByArea !== 1" /> -->
                      <i class="edit el-icon-edit-outline" @click="openChangeItemNameDialog(data)" v-if="data.isQuote !== 1 && data.isQuote !== 3 && data.isChooseByArea !== 1"></i>
                      <i class="remove treeRemove el-icon-minus" @click="removeNode(data, node)" v-if="!!!data.isQuote"></i>
                    </div>
                  </div>
                  <el-tooltip effect="dark" :content="node.label" placement="bottom-start" :disabled="isShowTooltip" v-else>
                    <div :class="['label' + data.grade, { isNew: data.isNew }]" @mouseenter="onMouseEnter(`label${data.grade + String(node.id)}`)">
                      <span :ref="'label' + data.grade + String(node.id)">{{ node.label }}</span>
                    </div>
                  </el-tooltip>
                </span>
              </el-tree>
            </div>
          </div>
        </div>
        <!-- 第三步 -->
        <div class="itemDialog" v-show="nodeLevel === 3">
          <div class="itemDialog-left">
            <div class="header hasSel">
              <div>新增分项工程</div>
              <el-select v-model="treeFilter4" placeholder="请选择" size="mini">
                <el-option label="显示全部" value=""></el-option>
                <el-option label="显示已有数据" value="1"></el-option>
                <el-option label="显示新增数据" value="2"></el-option>
              </el-select>
            </div>
            <div class="main">
              <!-- @node-expand="nodeExpand" -->
              <el-tree :expand-on-click-node="false" default-expand-all :data="secondList2" :props="defaultProps" ref="tree2" :filter-node-method="filterNode4">
                <span slot-scope="{ node, data }">
                  <el-tooltip effect="dark" :content="node.label" placement="bottom-start" :disabled="isShowTooltip">
                    <div v-if="node.level === nodeLevel" class="main-item">
                      <div :class="['label' + data.grade, { isNew: data.isNew }]" @mouseenter="onMouseEnter(`label${data.grade + String(node.id)}`)">
                        <span :ref="'label' + data.grade + String(node.id)">{{ node.label }}</span>
                      </div>
                      <i class="add el-icon-plus" @click="addNode(data, node)" v-if="data.isNew"></i>
                    </div>
                    <div v-else :class="['label' + data.grade, { isNew: data.isNew }]" @mouseenter="onMouseEnter(`label${data.grade + String(node.id)}`)">
                      <span :ref="'label' + data.grade + String(node.id)">{{ node.label }}</span>
                    </div>
                  </el-tooltip>
                </span>
              </el-tree>
            </div>
          </div>
          <div class="itemDialog-middle"><i class="el-icon-right"></i></div>
          <div class="itemDialog-right">
            <div class="header hasSel">
              <div>已选择分项表</div>
              <el-select v-model="treeFilter5" placeholder="请选择" size="mini">
                <el-option label="显示全部" value=""></el-option>
                <el-option label="显示已有数据" value="1"></el-option>
                <el-option label="显示新增数据" value="2"></el-option>
              </el-select>
            </div>
            <div class="main">
              <!-- @node-expand="nodeExpand" -->
              <el-tree :expand-on-click-node="false" default-expand-all :data="thirdList" :props="defaultProps" ref="addTree3" node-key="myId" :filter-node-method="filterNode5">
                <span slot-scope="{ node, data }">
                  <div v-if="node.level === nodeLevel" class="psr">
                    <!-- @input="(val) => inp(val, data)" -->
                    <div class="showNode" :class="{ isNew: data.isNew }" :title="node.label">{{ node.label }}</div>
                    <!-- <el-input :class="{inputNew:data.isNew}" size="mini" :value="node.label" :disabled="data.isQuote === 1 || data.isQuote === 3 || data.isChooseByArea === 1"></el-input> -->
                    <div class="operate">
                      <!-- <img src="../../../assets/edit.svg" class="edit el-icon-edit" @click="openChangeItemNameDialog(data)" v-if="data.isQuote !== 1 && data.isQuote !== 3 && data.isChooseByArea !== 1" /> -->
                      <i class="edit el-icon-edit-outline" @click="openChangeItemNameDialog(data)" v-if="data.isQuote !== 1 && data.isQuote !== 3 && data.isChooseByArea !== 1"></i>
                      <i class="remove treeRemove el-icon-minus" @click="removeNode(data, node)" v-if="!!!data.isQuote"></i>
                    </div>
                  </div>
                  <el-tooltip effect="dark" :content="node.label" placement="bottom-start" :disabled="isShowTooltip" v-else>
                    <div :class="['label' + data.grade, { isNew: data.isNew }]" @mouseenter="onMouseEnter(`label${data.grade + String(node.id)}`)">
                      <span :ref="'label' + data.grade + String(node.id)">{{ node.label }}</span>
                    </div>
                  </el-tooltip>
                </span>
              </el-tree>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" plain @click="back" v-if="nodeLevel > 1">上一步</el-button>
        <el-button type="primary" class="el-button-primary" @click="next" v-if="nodeLevel < 3 && cellList.length">下一步</el-button>
        <el-button type="primary" class="el-button-primary" v-if="nodeLevel === 3" @click="handleSaveLinkList">下一步</el-button>
      </span>
    </el-dialog>
    <!-- 修改名称弹框 -->
    <el-dialog :visible.sync="changeItemNameDialog" title="" width="30%" top="45vh" v-dialogDrag :close-on-click-modal="false" class="delheader">
      <div class="itemName">
        <div v-if="changeItemNameList.grade === 3 && changeItemNameList.itemType == 2" class="tunnel">
          <el-input size="mini" ref="itemName" class="name" maxlength="80" v-model="tunnelItemName.name" @keyup.enter.native="changeItemName" :disabled="changeItemNameList.isQuote === 1 || changeItemNameList.isQuote === 3 || changeItemNameList.isChooseByArea === 1"></el-input>
          <div class="str">{{ "(K" }}</div>
          <el-input size="mini" class="K" v-model.trim="tunnelItemName.Kone" maxlength="3" @input="tunnelItemName.Kone = $limitInputNumber(tunnelItemName.Kone, 999, 0, 0) - 0" @keydown.native="keyDown" @keyup.enter.native="changeItemName" :disabled="changeItemNameList.isQuote === 1 || changeItemNameList.isQuote === 3 || changeItemNameList.isChooseByArea === 1"></el-input>
          <div class="str">+</div>
          <el-input size="mini" class="add1" v-model.trim="tunnelItemName.add1" @input="addInputs($event, 1)" @blur="addBlur($event, 1)" @keydown.native="keyDown" @keyup.enter.native="changeItemName" :disabled="changeItemNameList.isQuote === 1 || changeItemNameList.isQuote === 3 || changeItemNameList.isChooseByArea === 1"></el-input>
          <div class="str">~K</div>
          <el-input size="mini" class="K" v-model.trim="tunnelItemName.Ktwo" maxlength="3" @input="tunnelItemName.Ktwo = $limitInputNumber(tunnelItemName.Ktwo, 999, 0, 0) - 0" @keydown.native="keyDown" @keyup.enter.native="changeItemName" :disabled="changeItemNameList.isQuote === 1 || changeItemNameList.isQuote === 3 || changeItemNameList.isChooseByArea === 1"></el-input>
          <div class="str">+</div>
          <el-input size="mini" class="add1" v-model.trim="tunnelItemName.add2" @input="addInputs($event, 2)" @blur="addBlur($event, 2)" @keydown.native="keyDown" @keyup.enter.native="changeItemName" :disabled="changeItemNameList.isQuote === 1 || changeItemNameList.isQuote === 3 || changeItemNameList.isChooseByArea === 1"></el-input>
          <div class="str">{{ ")" }}</div>
        </div>
        <div class="elseName wh-350" v-else>
          <el-input size="mini" ref="itemName" maxlength="100" v-model="elseItemName" @keyup.enter.native="changeItemName" :disabled="changeItemNameList.isQuote === 1 || changeItemNameList.isQuote === 3 || changeItemNameList.isChooseByArea === 1"></el-input>
        </div>
        <el-button size="mini" type="primary" class="changeItemName el-button-primary" @click="changeItemName">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="changeItemCodeDialog" title="" width="25%" top="45vh" v-dialogDrag :close-on-click-modal="false" class="delheader">
      <div class="itemCode">
        <div class="itemCode-content wh-80per">
          <el-input size="mini" v-if="changeItemCodeDialogType === 1" maxlength="5" v-model="itemCodes[0]" oninput="value=value.replace(/[^\d]/g,'')" @blur="itemCodes[0] = $event.target.value"></el-input>
          <div class="str" v-if="changeItemCodeDialogType > 1">{{ itemCodes[0] }}</div>
          <div class="line" v-if="changeItemCodeDialogType > 1">-</div>
          <el-input size="mini" v-if="changeItemCodeDialogType === 2" maxlength="5" v-model="itemCodes[1]" oninput="value=value.replace(/[^\d]/g,'')" @blur="itemCodes[1] = $event.target.value"></el-input>
          <div class="str" v-if="changeItemCodeDialogType == 3">{{ itemCodes[1] }}</div>
          <div class="line" v-if="changeItemCodeDialogType === 3">-</div>
          <el-input size="mini" v-if="changeItemCodeDialogType === 3" maxlength="5" v-model="itemCodes[2]" oninput="value=value.replace(/[^\d]/g,'')" @blur="itemCodes[2] = $event.target.value"></el-input>
        </div>
        <el-button size="mini" type="primary" class="changeItemCode el-button-primary" @click="changeItemCode">确定</el-button>
      </div>
    </el-dialog>
    <pdfPiev ref="pdfPiev" :urlr="drawingUrl" :drawList="drawList" :number="number" @recordsChange="recordsChange" />
  </div>
</template>

<script>
import pdfPiev from "@/components/pdf-preview/pdf-preview2";
import SearchBar from "./SearchBar.vue";
import { extractTree, listToTree } from "@/utils/commond";
import BpmnModdle from "bpmn-js";
import { CustomViewer } from "@/components/customBpmn";
import lodash from "lodash";
import taskFinishList from "@/components/taskFinishList/taskFinishList2.vue";
import acceptanceProcess from "../../../components/acceptanceProcess.vue";
import printJs from "print-js";
import utils from "@/utils/util";
export default {
  components: { pdfPiev, SearchBar, taskFinishList, acceptanceProcess },
  props: {
    proManDialog: {
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
      itemList: [],
      tableDate: [],
      treeDate: [],
      drawingUrl: "",
      //   关联图纸模态框
      RelateDialog: false,
      RelateList: [
        {
          fkItemId: "",
          beginPage: 1,
          endPage: 1,
          fkDrawingId: "",
          drawingPages: 0,
          id: 1
        }
      ],
      detailName: "",
      drawList: [],
      //   设置分项表模态框
      itemListDialog: false,
      //   节点层次
      nodeLevel: 1,
      cellList: [],
      firstList: [],
      secondList: [],
      thirdList: [],
      defaultProps: {
        label: "itemName",
        children: "prodItemLists"
      },
      fkItemId: "",
      checkedDetailIds: [],
      checkedMeIds: [],
      ProcessDialog: false,
      bpmnImg: "",
      bpmnModeler: null,
      preName: "",
      myId: "",
      randomKey: Math.random(),
      clickIsQuote: "",
      loading: false,
      loading2: false,
      loading3: false,
      setProMa: false,
      rowList: {},
      expandedKeys: [],
      changeItemNameDialog: false,
      changeItemNameList: {},
      elseItemName: "",
      tunnelItemName: {
        Kone: "",
        Ktwo: "",
        add1: "",
        add2: "",
        name: ""
      },
      isShowTooltip: true,
      isChange: false,
      changeItemCodeDialog: false,
      changeItemCodeDialogType: 1,
      itemCodes: [],
      changeItemCodeList: {},
      setShow: false,
      treeFilter1: "",
      treeFilter2: "",
      treeFilter3: "",
      treeFilter4: "",
      treeFilter5: "",
      firstList2: [],
      secondList2: [],
      loading4: false,
      number: 1,
      timers: null,
      maxLength: 3,
      list: []
    };
  },

  methods: {
    keyDown2(e) {
      const key = e.key;
      if (key === "e" || key === "-" || key === "." || key === "+") {
        e.returnValue = false;
        return false;
      }
      return true;
    },
    print() {
      this.loading = true;
      this.$api
        .printItemPdf({ fkOrgId: this.fkOrgId })
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
        .exportItem({ fkOrgId: this.fkOrgId })
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
    addInputs(e, type) {
      let max = 999;
      this.maxLength = 3;
      let num = 0;
      if (e.indexOf(".") != -1) {
        this.maxLength = 7;
        max = 999.999;
        num = 3;
      } else {
        this.maxLength = 3;
        max = 999;
        num = 0;
      }
      e = e.slice(0, this.maxLength);
      if (type == 1) {
        this.tunnelItemName.add1 = this.$limitInputNumber(e, max, 0, num);
      } else if (type == 2) {
        this.tunnelItemName.add2 = this.$limitInputNumber(e, max, 0, num);
      }
    },
    addBlur(e, type) {
      let arr = [];
      if (type == 1) {
        arr = this.tunnelItemName.add1.split(".");
        if ((arr[1] && !arr[1].length) || (arr[1] && arr[1] < 1)) {
          this.tunnelItemName.add1 = arr[0];
        }
      } else if (type == 2) {
        arr = this.tunnelItemName.add2.split(".");
        if ((arr[1] && !arr[1].length) || (arr[1] && arr[1] < 1)) {
          this.tunnelItemName.add2 = arr[0];
        }
      }
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
          this.clearTimer();
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
    nodeExpand(data, node) {
      if (node.level == 1) {
        this.expandNodes(node);
      }
    },
    expandNodes(node) {
      node.expanded = true;
      for (let i = 0; i < node.childNodes.length; i++) {
        node.childNodes[i].expanded = true;
        if (node.childNodes[i].childNodes.length > 0) {
          this.expandNodes(node.childNodes[i]);
        }
      }
    },
    // 获取分项工程表
    getItemList() {
      this.loading3 = true;
      this.$api
        .searchItems({ isLevel: 4, fkOrgId: this.fkOrgId })
        .then(res => {
          if (res.code === 200) {
            if (res.data && res.data.length) {
              this.setProMa = res.data.filter(item => item.isQuote === 3).length ? true : false;
            }
            this.itemList = res.data.map((item, index) => ({
              ...item,
              myId: String(index),
              pid: 0,
              prodItemLists: item.prodItemLists.map((item2, index2) => ({
                ...item2,
                myId: [index, index2].join("-"),
                pid: String(index),
                prodItemLists: item2.prodItemLists.map((item3, index3) => ({
                  ...item3,
                  myId: [index, index2, index3].join("-"),
                  pid: [index, index2].join("-")
                }))
              }))
            }));
            let arr = this.itemList.map(item => ({
              ...item,
              prodItemLists: item.prodItemLists.map(item2 => ({
                ...item2,
                prodItemLists: item2.prodItemLists.map(item3 => ({
                  ...item3
                }))
              }))
            }));
            this.treeDate = arr;
            if (!this.treeDate.length) {
              this.setShow = true;
            } else {
              this.setShow = false;
            }
            // this.tableDate = this.treeToArr(arr);
            this.$nextTick(() => {
              this.firstList = this.itemList.map(item => ({
                ...item,
                prodItemLists: item.prodItemLists.map(item2 => ({
                  ...item2,
                  prodItemLists: item2.prodItemLists.map(item3 => ({
                    ...item3
                  }))
                }))
              }));
              this.secondList = this.itemList.map(item => ({
                ...item,
                prodItemLists: item.prodItemLists.map(item2 => ({
                  ...item2,
                  prodItemLists: item2.prodItemLists.map(item3 => ({
                    ...item3
                  }))
                }))
              }));
              this.thirdList = this.itemList.map(item => ({
                ...item,
                prodItemLists: item.prodItemLists.map(item2 => ({
                  ...item2,
                  prodItemLists: item2.prodItemLists.map(item3 => ({
                    ...item3
                  }))
                }))
              }));
            });
          } else {
            this.$message.warning(res.msg);
          }
          this.loading3 = false;
        })
        .catch(err => {
          this.loading3 = false;
        });
    },
    //获取所有系统分项工程
    getbaseItemList() {
      this.loading2 = true;
      this.$api
        .baseItemListAll()
        .then(res => {
          if (res.code === 200) {
            if (res.data.length) {
              this.cellList = res.data;
            } else {
              this.cellList = [];
            }
          } else {
            this.$message.warning(res.msg);
          }
          this.loading2 = false;
        })
        .catch(err => {
          this.loading2 = false;
        });
    },
    // 把树形数据转为扁平数据
    treeToArr(list) {
      return extractTree(list, "prodItemLists", ["designQuantities", "fkNumberUnitId", "fkProjectId", "fkSysItemDetailId", "fkSysItemId", "fkSysParentId", "fkUnitId", "fkWorkflowId", "grade", "itemCode", "itemName", "itemType", "number", "numberUnit", "pkId", "prodItemListAdds", "reItemMaterials", "sortval", "unitName", "unitQuantity", "parentId", "index", "faIndex", "fkWorkflowTemplateId", "detailTables", "pid", "myId", "materials", "fkParentId", "isChoose", "fkUnitName", "reItemDrawings", "workflowName", "isQuote", "isChooseByArea"]);
    },
    treeToArr2(arr, children) {
      let newArr = [];
      for (let i = 0; i < arr.length; i++) {
        if (arr[i][children]) {
          //childrens存在
          newArr.push(...this.treeToArr2(arr[i][children], children));
          // delete arr[i][children];
        }
        newArr.push(arr[i]);
      }
      return newArr;
    },
    // 关闭模态框
    handleClose(type) {
      if (type === 1) {
        if (this.isChange) {
          this.$confirm("是否取消，取消后新增加的数据将不保存", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(() => {
            this.$emit("update:proManDialog", false);
            this.isChange = false;
            this.dialogType = 1;
          });
        } else {
          this.$emit("update:proManDialog", false);
          this.isChange = false;
          this.dialogType = 1;
        }
      } else if (type === 2) {
        this.$emit("update:proManDialog", false);
        this.isChange = false;
      }
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
          this.getItemList();
          this.dialogType = 1;
          this.isChange = false;
        });
      } else {
        this.setShow = false;
        this.isChange = false;
        this.dialogType = 1;
      }
    },
    // 保存按钮
    handleSave() {
      // let reg = /[\（|\(][A-Za-z]*[k|K]\d+\+\d{3}\~[A-Za-z]*[k|K]\d+\+\d{3}[\）|\)]/;
      // let keyArr=this.treeDate.length?Object.keys(this.treeDate[0]):[]
      let arr2 = this.treeToArr2(this.treeDate, "prodItemLists");
      console.log(arr2);
      for (var i = 0; i < arr2.length; i++) {
        for (var j = i + 1; j < arr2.length; j++) {
          if (arr2[i].itemCode === arr2[j].itemCode) {
            return this.$message.warning(`${arr2[i].itemCode},项目编号不能重复`);
          }
          if (arr2[i].pid === arr2[j].pid && arr2[i].itemName == arr2[j].itemName) {
            if (arr2[i].pid == 0) {
              return this.$message.warning(`错误名称${arr2[j].itemName},单位工程名称不能重复`);
            } else {
              return this.$message.warning(`错误名称${arr2[j].itemName}，同一父级下的名称不能重复`);
            }
          }
        }
        if (arr2[i].grade == 3 && arr2[i].itemType == 2 && [0, 2].includes(arr2[i].isQuote) && !arr2[i].isChooseByArea) {
          // let str = arr2[i].itemName.match(reg)[0];
          // let str = arr2[i].itemName;
          // let kuo=this.checksName(str)
          // if (kuo||!reg.test(str)) {
          //   this.openChangeItemNameDialog(arr2[i]);
          //   return this.$message.warning(kuo?`分项工程名称：${arr2[i].itemName},出现多个括号,不符合规范`:`分项工程名称：${arr2[i].itemName},不符合规范`);
          // }
          //   if (arr2[i].itemName.match(reg)) {
          //     let arr = arr2[i].itemName.match(reg)[0].split("~");
          //     let index1 =
          //       arr[0].indexOf("K") == -1
          //         ? arr[0].indexOf("k")
          //         : arr[0].indexOf("K");
          //     let index2 =
          //       arr[1].indexOf("K") == -1
          //         ? arr[1].indexOf("k")
          //         : arr[1].indexOf("K");
          //     let a = arr[0]
          //       .substring(index1 + 1)
          //       .split("+")
          //       .join("");
          //     let b = arr[1]
          //       .substring(index2 + 1, arr[1].length - 1)
          //       .split("+")
          //       .join("");
          //     if (a === b) {
          //       return this.$message.warning(
          //         `分项工程名称：${arr2[i].itemName},不符合规范`
          //       );
          //     }
          //   }
        }
      }
      let arr = listToTree(arr2, 0);
      this.loading = true;
      this.$api
        .addModifyProject({ prodItemListAdds: arr })
        .then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg);
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
    checksName(str) {
      let length1 = str.split("(").length - 1;
      let length2 = str.split("（").length - 1;
      let length3 = str.split(")").length - 1;
      let length4 = str.split("）").length - 1;
      if ((length1 && length2) || (length3 && length4) || length1 > 1 || length2 > 1 || length3 > 1 || length4 > 1) {
        return true;
      } else {
        return false;
      }
    },
    associationRules(item) {
      let arr = item.reItemDrawings ? item.reItemDrawings : [];
      this.getDrawList(true, arr);
    },
    // 关联图纸模态框
    // 查询所有工程图纸
    getDrawList(prev, list) {
      let data = {};
      if (this.orgType != 5) {
        data.fkOrgId = this.fkOrgId;
      }
      this.$api.queryDrawingData(data).then(res => {
        if (res.code === 200) {
          this.drawList = res.data;
          if (prev) {
            this.number = 1;
            let arr = [];
            // let arr2=res.data.filter(item=>arr.includes(item.pkId))
            list.forEach(item => {
              res.data.forEach(item2 => {
                if (item.fkDrawingId == item2.pkId) {
                  arr.push({ ...item, drawingUrl: item2.drawingUrl });
                }
              });
            });
            this.drawingUrl = arr[0].drawingUrl;
            this.number = arr[0].beginPage;
            this.$refs.pdfPiev.pdfShow = true;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    recordsChange(url) {
      console.log(url);
      this.drawingUrl = url;
      this.$refs.pdfPiev.preview();
    },
    // 打开
    handleOpenRelate(row) {
      this.rowList = row;
      console.log(row);
      row.reItemDrawings = row.reItemDrawings ? row.reItemDrawings : [];
      this.clickIsQuote = row.isQuote;
      if (this.dialogType === 1) {
        this.RelateList = row.reItemDrawings.map((item, idx) => ({ ...item, id: idx }));
      } else {
        this.RelateList = row.reItemDrawings.length
          ? row.reItemDrawings.map((item, idx) => ({ ...item, id: idx }))
          : [
              {
                fkItemId: "",
                beginPage: 1,
                endPage: 1,
                fkDrawingId: "",
                drawingPages: "",
                id: 1
              }
            ];
      }
      this.detailName = row.itemName;
      this.getDrawList();
      this.fkItemId = row.pkId;
      this.myId = row.myId;
      this.RelateDialog = true;
    },
    // 关闭
    handleCloseRelateDialog() {
      this.RelateList = [
        {
          fkItemId: "",
          beginPage: 1,
          endPage: 1,
          fkDrawingId: "",
          drawingPages: "",
          id: 1
        }
      ];
      this.fkItemId = "";
      this.RelateDialog = false;
      this.rowList = {};
    },
    // 保存按钮
    handleSaveRelate() {
      let stastus = false;
      this.isChange = true;
      // this.RelateList.forEach((item,index) => {
      //   if (item.beginPage - 0 > item.endPage - 0) {
      //     this.$message.warning("结束页数不能小于开始页数");
      //     stastus = true;
      //   }
      //   if (item.beginPage == 0) {
      //     this.$message.warning("开始页数不能为0或为空");
      //     stastus = true;
      //   } else if (item.endPage == 0) {
      //     this.$message.warning("结束页数不能为0或为空");
      //     stastus = true;
      //   }
      //   this.RelateList.forEach((item2,index2)=>{
      //     if(item.fkDrawingId==item2.fkDrawingId&&index!=index2){
      //       if(item.beginPage<item2.endPage||item.endPage>item2.beginPage){
      //         this.$message.warning("相同pdf关联页数不能有重复");
      //         stastus = true;
      //       }
      //     }
      //   })
      // });
      // if (stastus) {
      //   return;
      // }
      for (let i = 0; i < this.RelateList.length; i++) {
        const item = this.RelateList[i];
        if (item.beginPage - 0 > item.endPage - 0) {
          this.$message.warning("结束页数不能小于开始页数");
          return;
        }
        if (item.beginPage == 0) {
          this.$message.warning("开始页数不能为0或为空");
          return;
        } else if (item.endPage == 0) {
          this.$message.warning("结束页数不能为0或为空");
          return;
        }
        if (item.fkDrawingId) {
          for (let j = 0; j < this.RelateList.length; j++) {
            const item2 = this.RelateList[j];
            if (item.fkDrawingId == item2.fkDrawingId && i != j) {
              if (item.beginPage - 0 > item2.beginPage - 0 && item.beginPage - 0 > item2.endPage - 0) {
              } else if (item.beginPage - 0 < item2.beginPage - 0 && item.beginPage - 0 < item2.endPage - 0) {
              } else {
                console.log(item, item2);
                this.$message.warning("相同pdf关联页数不能有重复");
                return;
              }
            }
          }
        }
      }
      // let arr = this.tableDate.filter(item => item.myId === this.myId);
      // arr[0].reItemDrawings = [...this.RelateList.filter(item => item.fkDrawingId)];
      // this.randomKey = Math.random();
      this.$set(this.rowList, "reItemDrawings", [...this.RelateList.filter(item => item.fkDrawingId)]);
      // console.log(this.tableDate);
      this.handleCloseRelateDialog();
    },
    // 添加按钮
    handleAddRelate() {
      this.RelateList = [
        ...this.RelateList,
        {
          beginPage: 1,
          endPage: 1,
          fkDrawingId: "",
          fkItemId: this.fkItemId,
          drawingPages: "",
          id: Date.now()
        }
      ];
    },
    // 删除按钮
    handleRemoveRelate(id) {
      if (this.RelateList.length == 1) {
        this.RelateList = [
          {
            fkItemId: "",
            beginPage: 1,
            endPage: 1,
            fkDrawingId: "",
            drawingPages: "",
            id: 1
          }
        ];
      } else {
        this.RelateList = this.RelateList.filter(item => item.id !== id);
      }
    },
    // 改变事件
    drawChange() {
      this.drawList.forEach(item =>
        this.RelateList.forEach(item2 => {
          if (item2.fkDrawingId === item.pkId) {
            item2.drawingPages = item.drawingPages;
          }
        })
      );
    },
    // 输入事件
    drawInp(item) {
      if (item.beginPage < 1) {
        item.beginPage = 1;
        return;
      }
      if (item.endPage < 1) {
        item.endPage = item.beginPage ? item.beginPage : 1;
        return;
      }
      if (item.beginPage > item.drawingPages) {
        item.beginPage = item.drawingPages;
        this.$message.warning("输入页数不能大于图纸页数");
      }
      if (item.endPage > item.drawingPages) {
        item.endPage = item.drawingPages;
        this.$message.warning("输入页数不能大于图纸页数");
      }
    },
    drawBlur() {
      for (let i = 0; i < this.RelateList.length; i++) {
        const item = this.RelateList[i];
        if (item.fkDrawingId) {
          for (let j = 0; j < this.RelateList.length; j++) {
            const item2 = this.RelateList[j];
            if (item.fkDrawingId == item2.fkDrawingId && i != j) {
              if (item.beginPage - 0 > item2.beginPage - 0 && item.beginPage - 0 > item2.endPage - 0) {
              } else if (item.beginPage - 0 < item2.beginPage - 0 && item.beginPage - 0 < item2.endPage - 0) {
              } else {
                console.log(item, item2);
                this.$message.warning("相同pdf关联页数不能有重复");
                return;
              }
            }
          }
        }
      }
    },

    // 分项表模态框
    // 打开
    openItemListDialog() {
      // if (this.setProMa) {
      //   return this.$message.warning("存在未完成的生产审批流程");
      // }
      this.getbaseItemList();
      this.itemListDialog = true;
      this.firstList = this.treeDate.map(item => ({
        ...item,
        prodItemLists: item.prodItemLists.map(item2 => ({
          ...item2,
          prodItemLists: item2.prodItemLists.map(item3 => ({
            ...item3
          }))
        }))
      }));
      this.secondList = this.treeDate.map(item => ({
        ...item,
        prodItemLists: item.prodItemLists.map(item2 => ({
          ...item2,
          prodItemLists: item2.prodItemLists.map(item3 => ({
            ...item3
          }))
        }))
      }));
      this.thirdList = this.treeDate.map(item => ({
        ...item,
        prodItemLists: item.prodItemLists.map(item2 => ({
          ...item2,
          prodItemLists: item2.prodItemLists.map(item3 => ({
            ...item3
          }))
        }))
      }));
      console.log(this.thirdList);
    },
    // 上一步
    back() {
      if (this.nodeLevel < 4) {
        this.expandedKeys = [];
        if (this.nodeLevel === 3) {
          this.expandedKeys = this.firstList.map(item => item.myId);
        }
      }
      this.nodeLevel--;
      this.treeFilter1 = "";
      this.treeFilter2 = "";
      this.treeFilter3 = "";
      this.treeFilter4 = "";
      this.treeFilter5 = "";
    },
    // 下一步
    next() {
      if (this.nodeLevel < 4) {
        this.expandedKeys = [];
        if (this.nodeLevel === 1) {
          this.expandedKeys = this.firstList.map(item => item.myId);
        }
      }
      this.loading4 = true;
      if (this.nodeLevel == 1) {
        this.firstList2 = lodash.cloneDeep(this.firstList);
        this.cellList.forEach(item => {
          this.firstList2.forEach(item2 => {
            if (item.pkId === item2.fkSysItemId && !item2.isAdd) {
              item2.prodItemLists.push(...item.prodItemLists.map((item3, index) => ({ ...item3, myId: item2.myId + "new" + index, isNew: true, prodItemLists: [] })));
            }
          });
        });
      } else if (this.nodeLevel == 2) {
        this.secondList2 = lodash.cloneDeep(this.secondList);
        this.cellList.forEach(item => {
          this.secondList2.forEach(item2 => {
            if (item.pkId === item2.fkSysItemId && !item2.isAdd) {
              item.prodItemLists.forEach(item3 => {
                item2.prodItemLists.forEach(item4 => {
                  if (item3.pkId === item4.fkSysItemId && !item4.isAdd) {
                    item4.prodItemLists.push(...item3.prodItemLists.map((item5, index) => ({ ...item5, myId: item4.myId + "new" + index, isNew: true })));
                  }
                });
              });
            }
          });
        });
      }
      this.nodeLevel++;
      this.loading4 = false;
      this.treeFilter1 = "";
      this.treeFilter2 = "";
      this.treeFilter3 = "";
      this.treeFilter4 = "";
      this.treeFilter5 = "";
    },
    // 关闭
    handleCloseItemListDialog() {
      this.itemListDialog = false;
      this.nodeLevel = 1;
      this.treeFilter1 = "";
      this.treeFilter2 = "";
      this.treeFilter3 = "";
      this.treeFilter4 = "";
      this.treeFilter5 = "";
    },
    // 让树形里的input能双向绑定
    inp(value, data) {
      data.itemName = value;
      if (this.nodeLevel === 1) {
        let arr1 = this.secondList.filter(item => item.myId === data.myId);
        let arr2 = this.thirdList.filter(item => item.myId === data.myId);
        if (arr1.length) {
          arr1[0].itemName = value;
        }
        if (arr2.length) {
          arr2[0].itemName = value;
        }
      } else if (this.nodeLevel === 2) {
        this.thirdList.forEach(item =>
          item.prodItemLists.forEach(item2 => {
            if (item2.myId === data.myId) {
              item2.itemName = value;
            }
          })
        );
      }
    },
    // 点击添加节点
    addNode(data, node) {
      if (this.nodeLevel === 1) {
        this.cellList.forEach(item => {
          if (item.pkId === data.pkId) {
            let add = {
              ...item,
              itemName: item.itemName + (this.firstList.filter(item2 => item2.itemName.indexOf(item.itemName) !== -1).length ? this.firstList.filter(item2 => item2.itemName.indexOf(item.itemName) !== -1).length : ""),
              myId: this.firstList.length ? String(this.firstList[this.firstList.length - 1].myId - 0 + 1) : "0",
              fkSysItemId: data.fkSysItemId ? data.fkSysItemId : data.pkId,
              fkSysParentId: data.fkSysParentId ? data.fkSysParentId : data.parentId,
              fkWorkflowId: data.fkWorkflowId ? data.fkWorkflowId : data.fkWorkflowTemplateId,
              pkId: null,
              parentId: null,
              isQuote: 0,
              isNew: true,
              isAdd: true,
              fkWorkflowTemplateId: null,
              prodItemLists: item.prodItemLists.map(item2 => ({
                ...item2,
                isNew: true,
                isAdd: true,
                prodItemLists: []
              }))
            };
            this.firstList.push(add);
            this.positions("addTree1", add.myId);
          }
        });
        this.$nextTick(() => {
          this.$refs.addTree1.filter();
        });
        // this.firstList = [
        //   ...this.firstList,
        //   {
        //     ...data,
        //     itemName: data.itemName + (this.firstList.length + 1),
        //     index: this.firstList.length,
        //     myId: String(this.firstList.length),
        //     fkSysItemId: data.pkId,
        //     fkSysParentId: data.parentId,
        //     fkWorkflowId: data.fkWorkflowTemplateId,
        //     pkId: null,
        //     parentId: null,
        //     fkWorkflowTemplateId: null,
        //     // fkSysItemId: data.fkSysItemId ? data.fkSysItemId : data.pkId,
        //     // fkSysParentId: data.fkSysParentId
        //     //   ? data.fkSysParentId
        //     //   : data.parentId,
        //     // fkWorkflowId: data.fkWorkflowId
        //     //   ? data.fkWorkflowId
        //     //   : data.fkWorkflowTemplateId,
        //   },
        // ];
      } else if (this.nodeLevel === 2) {
        const index = this.secondList.findIndex(item => item.myId === node.parent.data.myId);
        // 判定父节点是否相同，相同加在同父节点下面，不同新增一个父节点
        if (index !== -1) {
          this.cellList.forEach(item => {
            item.prodItemLists.forEach(item2 => {
              if (data.pkId === item2.pkId || data.fkSysItemId === item2.pkId) {
                let add = {
                  ...data,
                  itemName: item2.itemName + (this.secondList[index].prodItemLists.filter(i => i.itemName.indexOf(item2.itemName) !== -1).length ? this.secondList[index].prodItemLists.filter(i => i.itemName.indexOf(item2.itemName) !== -1).length : ""),
                  faIndex: this.secondList[index].index,
                  myId: [this.secondList[index].myId, this.secondList[index].prodItemLists.length].join("-"),
                  fkSysItemId: data.fkSysItemId ? data.fkSysItemId : data.pkId,
                  fkSysParentId: data.fkSysParentId ? data.fkSysParentId : data.parentId,
                  fkWorkflowId: data.fkWorkflowId ? data.fkWorkflowId : data.fkWorkflowTemplateId,
                  pkId: null,
                  parentId: null,
                  isNew: true,
                  isAdd: true,
                  fkWorkflowTemplateId: null,
                  prodItemLists: item2.prodItemLists.map(item3 => ({
                    ...item3,
                    isNew: true,
                    isAdd: true,
                    prodItemLists: []
                  })),
                  isQuote: 0
                };
                this.secondList[index].prodItemLists.push(add);
                this.positions("addTree2", add.myId, node);
              }
            });
          });
          // this.secondList[index].prodItemLists = [
          //   ...this.secondList[index].prodItemLists,
          //   {
          //     ...data,
          //     itemName:
          //       data.itemName +
          //       (this.secondList[index].prodItemLists.length + 1),
          //     index: this.secondList[index].prodItemLists.length,
          //     faIndex: this.secondList[index].index,
          //     myId: [
          //       this.secondList[index].myId,
          //       this.secondList[index].prodItemLists.length,
          //     ].join("-"),
          //     fkSysItemId: data.pkId,
          //     fkSysParentId: data.parentId,
          //     fkWorkflowId: data.fkWorkflowTemplateId,
          //     pkId: null,
          //     parentId: null,
          //     fkWorkflowTemplateId: null,
          //   },
          // ];
        } else {
          this.cellList.forEach(item => {
            item.prodItemLists.forEach(item2 => {
              if (data.pkId === item2.pkId) {
                this.secondList = [
                  ...this.secondList,
                  {
                    ...node.parent.data,
                    prodItemLists: [
                      {
                        ...data,
                        index: 0,
                        faIndex: item.index,
                        myId: [node.parent.data.myId, 0].join("-"),
                        fkSysItemId: data.fkSysItemId ? data.fkSysItemId : data.pkId,
                        fkSysParentId: data.fkSysParentId ? data.fkSysParentId : data.parentId,
                        fkWorkflowId: data.fkWorkflowId ? data.fkWorkflowId : data.fkWorkflowTemplateId,
                        pkId: null,
                        parentId: null,
                        fkWorkflowTemplateId: null,
                        isNew: true,
                        isAdd: true,
                        prodItemLists: item2.prodItemLists.map(item3 => ({
                          ...item3,
                          isNew: true,
                          isAdd: true,
                          prodItemLists: []
                        })),
                        isQuote: 0
                      }
                    ]
                  }
                ];
                this.$nextTick(() => {
                  console.log(this.$refs.addTree2.getNode([node.parent.data.myId, 0].join("-")));
                  this.positions("addTree2", [node.parent.data.myId, 0].join("-"));
                });
              }
            });
          });
          // this.secondList = [
          //   ...this.secondList,
          //   {
          //     ...node.parent.data,
          //     prodItemLists: [
          //       {
          //         ...data,
          //         index: 0,
          //         faIndex: node.parent.data.index,
          //         myId: [node.parent.data.myId, 0].join("-"),
          //         fkSysItemId: data.pkId,
          //         fkSysParentId: data.parentId,
          //         fkWorkflowId: data.fkWorkflowTemplateId,
          //         pkId: null,
          //         parentId: null,
          //         fkWorkflowTemplateId: null,
          //       },
          //     ],
          //   },
          // ];
        }
        this.$nextTick(() => {
          this.$refs.addTree2.filter();
        });
      } else if (this.nodeLevel === 3) {
        const index = this.thirdList.findIndex(item => item.myId === node.parent.parent.data.myId);
        if (index !== -1) {
          const index2 = this.thirdList[index].prodItemLists.findIndex(item => {
            return item.myId === node.parent.data.myId;
          });
          if (index2 !== -1) {
            let aobj = this.thirdList[index].prodItemLists[index2].prodItemLists[this.thirdList[index].prodItemLists[index2].prodItemLists.length - 1];
            let anum = 0;
            if (this.thirdList[index].prodItemLists[index2].prodItemLists.filter(ite => !ite.isAdd).length) {
              let aarr = aobj.myId.split("-");
              anum = aarr[aarr.length - 1] - 0 + 1;
            } else {
              anum = this.thirdList[index].prodItemLists[index2].prodItemLists.length;
            }
            let add = {
              ...data,
              itemName: data.itemName + (this.thirdList[index].prodItemLists[index2].prodItemLists.filter(i => i.itemName.indexOf(data.itemName) !== -1).length ? this.thirdList[index].prodItemLists[index2].prodItemLists.filter(i => i.itemName.indexOf(data.itemName) !== -1).length : ""),
              index: this.thirdList[index].prodItemLists[index2].prodItemLists.length,
              faIndex: this.thirdList[index].prodItemLists[index2].index,
              myId: [node.parent.data.myId, anum].join("-"),
              fkSysItemId: data.fkSysItemId ? data.fkSysItemId : data.pkId,
              fkSysParentId: data.parentId,
              fkWorkflowId: data.fkWorkflowTemplateId,
              pkId: null,
              isNew: true,
              isAdd: true,
              parentId: null,
              fkWorkflowTemplateId: null,
              isQuote: 0
            };
            this.thirdList[index].prodItemLists[index2].prodItemLists = [...this.thirdList[index].prodItemLists[index2].prodItemLists, add];
            this.$nextTick(() => {
              this.positions("addTree3", add.myId);
            });
          } else {
            this.thirdList[index].prodItemLists.push({
              ...node.parent.data,
              isNew: true,
              isAdd: true,
              prodItemLists: [
                {
                  ...data,
                  index: 0,
                  faIndex: node.parent.data.index,
                  myId: [node.parent.data.myId, 0].join("-"),
                  fkSysItemId: data.fkSysItemId ? data.fkSysItemId : data.pkId,
                  fkSysParentId: data.parentId,
                  fkWorkflowId: data.fkWorkflowTemplateId,
                  pkId: null,
                  isNew: true,
                  isAdd: true,
                  parentId: null,
                  fkWorkflowTemplateId: null,
                  isQuote: 0
                }
              ]
            });
            console.log(node.parent.data.myId);
            this.$nextTick(() => {
              this.positions("addTree3", [node.parent.data.myId, 0].join("-"));
            });
          }
        } else {
          this.thirdList = [
            ...this.thirdList,
            {
              ...node.parent.parent.data,
              prodItemLists: [
                {
                  ...node.parent.data,
                  prodItemLists: [
                    ...node.parent.data,
                    {
                      ...data,
                      index: 0,
                      faIndex: node.parent.data.index,
                      myId: [node.parent.data.myId, 0].join("-"),
                      fkSysItemId: data.fkSysItemId ? data.fkSysItemId : data.pkId,
                      fkSysParentId: data.parentId,
                      fkWorkflowId: data.fkWorkflowTemplateId,
                      pkId: null,
                      isNew: true,
                      isAdd: true,
                      parentId: null,
                      fkWorkflowTemplateId: null,
                      isQuote: 0
                    }
                  ]
                }
              ]
            }
          ];
          console.log(node.parent.data.myId);
          this.$nextTick(() => {
            this.positions("addTree3", [node.parent.data.myId, 0].join("-"));
          });
        }
        this.$nextTick(() => {
          this.$refs.addTree3.filter();
        });
      }
    },
    // 删除节点
    removeNode(data, node) {
      this.$confirm("确定要删除该分项？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        if (this.nodeLevel === 1) {
          this.firstList = this.firstList.filter(item => item.myId !== data.myId);
          // 删除时判定后面的列表是否为空，如果有相应数据就一并删除
          if (this.secondList.length > 0) {
            this.secondList = this.secondList.filter(item => item.myId !== data.myId);
          }
          if (this.thirdList.length > 0) {
            this.thirdList = this.thirdList.filter(item => item.myId !== data.myId);
          }
          this.$nextTick(() => {
            this.$refs.addTree1.filter();
          });
        } else if (this.nodeLevel === 2) {
          const index = this.secondList.findIndex(item => item.myId === node.parent.data.myId);
          if (this.secondList[index].prodItemLists.length > 1) {
            this.secondList[index].prodItemLists = this.secondList[index].prodItemLists.filter(item => item.myId !== data.myId);

            if (this.thirdList.length > 0) {
              const fatherIndex = this.thirdList.findIndex(item => item.myId === this.secondList[index].myId);
              if (this.thirdList[fatherIndex]) {
                this.thirdList[fatherIndex].prodItemLists = this.thirdList[fatherIndex].prodItemLists.filter(item => item.myId !== data.myId);
              }
            }
          } else {
            this.secondList.splice(index, 1);
            this.thirdList.splice(index, 1);
          }
          this.$nextTick(() => {
            this.$refs.addTree2.filter();
          });
        } else if (this.nodeLevel === 3) {
          const index = this.thirdList.findIndex(item => item.myId === node.parent.parent.data.myId);

          const index2 = this.thirdList[index].prodItemLists.findIndex(item => item.myId === node.parent.data.myId);
          if (this.thirdList[index].prodItemLists[index2].prodItemLists.length > 1) {
            this.thirdList[index].prodItemLists[index2].prodItemLists = this.thirdList[index].prodItemLists[index2].prodItemLists.filter(item => item.myId !== data.myId);
          } else {
            if (this.thirdList[index].prodItemLists.length > 1) {
              this.thirdList[index].prodItemLists.splice(index2, 1);
            } else {
              this.thirdList.splice(index, 1);
            }
          }
        }
        this.$nextTick(() => {
          this.$refs.addTree3.filter();
        });
      });
      // this.firstList = this.firstList.map((item, index) => ({
      //   ...item,
      //   myId: String(index),
      //   prodItemLists: item.prodItemLists.map((item2, index2) => ({
      //     ...item2,
      //     myId: [index, index2].join("-"),
      //     prodItemLists: item2.prodItemLists.map((item3, index3) => ({
      //       ...item3,
      //       myId: [index, index2, index3].join("-"),
      //       prodItemLists: item3.prodItemLists.map((item4, index4) => ({
      //         ...item4,
      //         myId: [index, index2, index3, index4].join("-"),
      //       })),
      //     })),
      //   })),
      // }));
    },
    // 保存分项表
    handleSaveLinkList() {
      this.isChange = true;
      this.dialogType = 2;
      console.log(this.thirdList);
      let notNewArr3 = this.thirdList.filter(item => !item.isAdd);
      let arr = this.thirdList.map((item, index1) => {
        let obj = { ...item, pid: 0 };
        let nums3 = 0;
        if (notNewArr3.length && notNewArr3.length - 1 < index1) {
          let backArr = notNewArr3[notNewArr3.length - 1].itemCode.split("-");
          nums3 = backArr[backArr.length - 1] - 0 + (index1 - (notNewArr3.length - 1));
        } else {
          nums3 = index1 + 1;
        }
        obj.itemCode = !item.isAdd ? item.itemCode : nums3;
        // obj.itemCode=!item.isAdd?item.itemCode: String(index1 + 1)
        let notNewArr2 = obj.prodItemLists.filter(item => !item.isAdd);
        obj.prodItemLists = item.prodItemLists.map((item2, index2) => {
          let obj2 = { ...item2, pid: item.myId };
          let nums2 = 0;
          // obj2.itemCode=!item2.isAdd?item2.itemCode:[obj.itemCode, index2 + 1].join("-")
          if (notNewArr2.length && notNewArr2.length - 1 < index2) {
            let backArr = notNewArr2[notNewArr2.length - 1].itemCode.split("-");
            nums2 = backArr[backArr.length - 1] - 0 + (index2 - (notNewArr2.length - 1));
          } else {
            nums2 = index2 + 1;
          }
          obj2.itemCode = !item2.isAdd ? item2.itemCode : [obj.itemCode, nums2].join("-");
          let notNewArr = obj2.prodItemLists.filter(item => !item.isAdd);
          obj2.prodItemLists = item2.prodItemLists.map((item3, index3) => {
            let obj3 = { ...item3, pid: item2.myId };
            let nums = 0;
            if (notNewArr.length && notNewArr.length - 1 < index3) {
              let backArr = notNewArr[notNewArr.length - 1].itemCode.split("-");
              nums = backArr[backArr.length - 1] - 0 + (index3 - (notNewArr.length - 1));
            } else {
              nums = index3 + 1;
            }
            obj3.itemCode = !item3.isAdd ? item3.itemCode : [obj2.itemCode, nums].join("-");
            obj3.isAdd = false;
            obj3.isNew = false;
            return obj3;
          });
          obj2.isAdd = false;
          obj2.isNew = false;
          return obj2;
        });
        obj.isAdd = false;
        obj.isNew = false;
        return obj;
      });
      // this.tableDate = this.treeToArr(arr);
      this.treeDate = arr;
      // 将隧道工程的名称转换为工程量
      // let reg = /[\（|\(][A-Za-z]*[k|K]\d+\+\d{3}\~[A-Za-z]*[k|K]\d+\+\d{3}[\）|\)]/;
      this.treeDate.forEach(item => {
        item.prodItemLists.forEach(item2 => {
          item2.prodItemLists.forEach(item3 => {
            if (item3.grade === 3 && item3.itemType == 2 && [0, 2].includes(item3.isQuote) && !item3.isChooseByArea) {
              let idx1 = item3.itemName.lastIndexOf("(");
              let idx2 = item3.itemName.lastIndexOf("（");
              let idx3 = item3.itemName.lastIndexOf(")");
              let idx4 = item3.itemName.lastIndexOf("）");
              if ((idx1 != -1 && (idx3 != -1 || idx4 != -1)) || (idx2 != -1 && (idx3 != -1 || idx4 != -1))) {
                let arr = [];
                if (idx1 != -1) {
                  if (idx3 != -1) {
                    arr = item3.itemName.substring(idx1, idx3 + 1).split("~");
                  } else if (idx4 != -1) {
                    arr = item3.itemName.substring(idx1, idx4 + 1).split("~");
                  }
                } else if (idx2 != -1) {
                  if (idx3 != -1) {
                    arr = item3.itemName.substring(idx2, idx3 + 1).split("~");
                  } else if (idx4 != -1) {
                    arr = item3.itemName.substring(idx2, idx4 + 1).split("~");
                  }
                }
                console.log(arr);
                // let arr = item3.itemName.match(reg)[0].split("~");
                // let arr=item3.
                let index1 = arr[0].indexOf("K") == -1 ? arr[0].indexOf("k") : arr[0].indexOf("K");
                let index2 = arr[1].indexOf("K") == -1 ? arr[1].indexOf("k") : arr[1].indexOf("K");
                let a = arr[0]
                  .substring(index1 + 1)
                  .split("+")
                  .join("");
                let b = arr[1]
                  .substring(index2 + 1, arr[1].length - 1)
                  .split("+")
                  .join("");
                if (a - 0 > b - 0) {
                  item3.number = (a - 0 - (b - 0)).toFixed(3) - 0;
                } else if (a - 0 < b - 0) {
                  item3.number = (b - 0 - (a - 0)).toFixed(3) - 0;
                } else {
                  item3.number = 0;
                }
              }
            }
          });
        });
      });
      this.handleCloseItemListDialog();
      if (this.treeDate.length) {
        this.setShow = false;
      } else {
        this.setShow = true;
      }
    },
    // 根据分项工程ID获取对应流程以及付带的所有数据集（流程节点、表格和资料）
    inEstimate(row) {
      let data = {};
      if (row.pkId) {
        data = { itemId: row.pkId };
      } else {
        data = { baseItemId: row.fkSysItemId };
      }
      this.ProcessDialog = true;
      this.$api.getWorkflowTemplateByItemId(data).then(res => {
        if (res.code === 200) {
          // this.bpmnImg = res.data.bpmnContent;
          // this.preName = res.data.workflowName;
          // this.init("preCan2");
          // this.list = res.data.workflowNodeDTOS;
          this.$nextTick(() => {
            this.$refs.productionApproval4.editInit(res.data, false);
          });
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 打开工序流程图模态框
    openProcessDialog(row) {
      let id = row.pkId ? row.pkId : row.fkSysItemId;
      let type = row.pkId ? 1 : 0;
      this.inEstimate(id, type);
      this.ProcessDialog = true;
    },
    //创建流程图预览的方法
    init(domId) {
      // 获取到属性ref为“canvas”的dom节点
      document.getElementById(domId).innerHTML = "";
      const canva = this.$refs[domId];
      //新建流程 用dom元素绘画svg ====> canvas
      this.bpmnModeler = new CustomViewer({ container: canva });
      // this.bpmnImg 是xml 后端返回的数据
      this.bpmnModeler.importXML(this.bpmnImg, err => {
        if (err) {
          this.$message.warning("获取流程图失败");
        } else {
          // 这里是成功之后的回调, 可以在这里做一系列事情
          // this.bpmnModeler.get("canvas").zoom("fit-viewport", "auto");
          document.querySelector(".bjs-powered-by").style = "display:none";
        }
      });
    },
    // 弹出修改名称弹框
    openChangeItemNameDialog(row) {
      console.log(row);
      this.changeItemNameList = row;
      if (row.grade === 3 && row.itemType == 2) {
        this.tunnelChange(row.itemName);
      } else {
        this.elseItemName = row.itemName;
      }
      this.changeItemNameDialog = true;
      this.$nextTick(() => {
        this.$refs.itemName.focus();
      });
    },
    // 隧道名称转换
    tunnelChange(itemName) {
      // let reg = /[\（|\(][A-Za-z]*[k|K]\d+\+\d{3}\~[A-Za-z]*[k|K]\d+\+\d{3}[\）|\)]/;
      let idx1 = itemName.lastIndexOf("(");
      let idx2 = itemName.lastIndexOf("（");
      let idx3 = itemName.lastIndexOf(")");
      let idx4 = itemName.lastIndexOf("）");
      if ((idx1 != -1 && (idx3 != -1 || idx4 != -1)) || (idx2 != -1 && (idx3 != -1 || idx4 != -1))) {
        let arr = [];
        let str = "";
        if (idx1 != -1) {
          if (idx3 != -1) {
            str = itemName.substring(idx1, idx3 + 1);
          } else if (idx4 != -1) {
            str = itemName.substring(idx1, idx4 + 1);
          }
        } else if (idx2 != -1) {
          if (idx3 != -1) {
            str = itemName.substring(idx2, idx3 + 1);
          } else if (idx4 != -1) {
            str = itemName.substring(idx2, idx4 + 1);
          }
        }
        arr = str.split("~");
        // let arr = itemName.match(reg)[0].split("~");
        // let index1 =
        //   arr[0].indexOf("K") == -1 ? arr[0].indexOf("k") : arr[0].indexOf("K");
        // let index2 =
        //   arr[1].indexOf("K") == -1 ? arr[1].indexOf("k") : arr[1].indexOf("K");
        // let a = arr[0].substring(index1 + 1).split("+");
        // let b = arr[1].substring(index2 + 1, arr[1].length - 1).split("+");
        let str1 = arr[0].indexOf("K") == -1 ? arr[0].split("k") : arr[0].split("K");
        let str2 = arr[1].indexOf("K") == -1 ? arr[1].split("k") : arr[1].split("K");
        let a = str1[1].split("+");
        let b = str2[1].split("+");
        // replaceAll仅在chrome 85 以上版本才支持，需要替换为replace
        // replace(/[a]/g, "")
        // let Kbefore1 = str1[0].indexOf("(") !== -1 ? str1[0].replaceAll("(", "") : str1[0].replaceAll("（", "");
        let Kbefore1 = str1[0].indexOf("(") !== -1 ? str1[0].replace(/[(]/g, "") :str1[0].replace(/[（]/g, "");
        let nameIdx = itemName.indexOf(str);
        // console.log(arr, index1, index2, str1, str2, a, b, Kbefore1, str2[0]);
        this.tunnelItemName = {
          Kone: a[0],
          Ktwo: b[0],
          add1: a[1],
          add2: b[1].indexOf(")") !== -1 ? b[1].replace(/[)]/g, "") : replace(/[）]/g, ""),
          name: nameIdx == 0 ? itemName.substring(str.length, itemName.length) : itemName.substring(0, nameIdx)
        };
      } else {
        this.tunnelItemName.name = itemName;
      }
    },
    // 修改名字确认弹框
    changeItemName() {
      this.isChange = true;
      // let reg = /[\（|\(][A-Za-z]*[k|K]\d+\+\d{3}\~[A-Za-z]*[k|K]\d+\+\d{3}[\）|\)]/;
      if (this.changeItemNameList.grade === 3 && this.changeItemNameList.itemType == 2) {
        let { Kone, Ktwo, add1, add2, name } = this.tunnelItemName;
        console.log(Kone, Ktwo, add1, add2, name);
        // add1=Number(add1)
        // add2=Number(add2)
        let addArr1 = add1.split(".");
        let addArr2 = add2.split(".");
        if ((addArr1[1] && !addArr1[1].length) || (addArr1[1] && addArr1[1] < 1)) {
          add1 = addArr1[0];
        }
        if ((addArr2[1] && !addArr2[1].length) || (addArr2[1] && addArr2[1] < 1)) {
          add2 = addArr2[0];
        }
        if (this.itemListDialog) {
          let barr = [];
          let idArr = this.changeItemNameList.myId.split("-");
          this.thirdList.forEach(item => {
            if (idArr[0] == item.myId) {
              item.prodItemLists.forEach(item2 => {
                if (`${idArr[0]}-${idArr[1]}` === item2.myId) {
                  item2.prodItemLists.forEach(item3 => {
                    if (item3.myId !== this.changeItemNameList.myId && item3.itemName == `${name}(K${Kone}+${add1}~K${Ktwo}+${add2})`) {
                      barr.push(item3);
                    }
                  });
                }
              });
            }
          });
          if (barr.length) {
            return this.$message.warning("名字出现重复");
          }
        }
        if (`${name}(K${Kone}+${add1}~K${Ktwo}+${add2})`.length > 100) {
          return this.$message.warning("项目名称不能大于100个字");
        }
        if (String(add1).length < 3 || String(add2).length < 3) {
          return this.$message.warning("+号后面的值必须为3位数或3位数带最多三位小数，例如：010或010.1");
        }
        // if (!`${name}(K${Kone}+${add1}~K${Ktwo}+${add2})`.match(reg)) {
        //   return this.$message.warning("名称输入错误");
        // }
        if (String(Kone) + String(add1) - 0 > String(Ktwo) + String(add2) - 0) {
          this.changeItemNameList.number = (String(Kone) + String(add1) - (String(Ktwo) + String(add2))).toFixed(3) - 0;
        } else if (String(Kone) + String(add1) == String(Ktwo) + String(add2)) {
          return this.$message.warning("开始里程不能跟结束里程相等");
        } else {
          this.changeItemNameList.number = (String(Ktwo) + String(add2) - 0 - (String(Kone) + String(add1) - 0)).toFixed(3) - 0;
        }
        if (this.checksName(`${name}(K${Kone}+${add1}~K${Ktwo}+${add2})`)) {
          return this.$message.warning("名字中不能出现括号");
        }
        this.changeItemNameList.itemName = `${name}(K${Kone}+${add1}~K${Ktwo}+${add2})`;
        this.closeItemNameDialog();
      } else {
        if (this.itemListDialog) {
          let barr = [];
          if (this.nodeLevel == 1) {
            barr = this.firstList.filter(item => item.myId !== this.changeItemNameList.myId && item.itemName == this.elseItemName);
            // if() this.elseItemName
            console.log(barr, this.changeItemNameList);
          } else if (this.nodeLevel == 2) {
            let idArr = this.changeItemNameList.myId.split("-");
            this.secondList.forEach(item => {
              if (idArr[0] == item.myId) {
                item.prodItemLists.forEach(item2 => {
                  if (item2.myId !== this.changeItemNameList.myId && item2.itemName == this.elseItemName) {
                    barr.push(item2);
                  }
                });
              }
            });
          } else if (this.nodeLevel == 3) {
            let idArr = this.changeItemNameList.myId.split("-");
            this.thirdList.forEach(item => {
              if (idArr[0] == item.myId) {
                item.prodItemLists.forEach(item2 => {
                  if (`${idArr[0]}-${idArr[1]}` === item2.myId) {
                    item2.prodItemLists.forEach(item3 => {
                      if (item3.myId !== this.changeItemNameList.myId && item3.itemName == this.elseItemName) {
                        barr.push(item3);
                      }
                    });
                  }
                });
              }
            });
          }
          if (barr.length) {
            return this.$message.warning("名字出现重复");
          }
        }

        if (!this.elseItemName.length) {
          return this.$message.warning("请输入项目名称");
        }
        if (this.elseItemName.length > 100) {
          return this.$message.warning("项目名称不能大于100个字");
        }
        this.changeItemNameList.itemName = this.elseItemName;
        // 同步更改后面的名字
        if (this.nodeLevel === 1) {
          let arr1 = this.secondList.filter(item => item.myId === this.changeItemNameList.myId);
          let arr2 = this.thirdList.filter(item => item.myId === this.changeItemNameList.myId);
          if (arr1.length) {
            arr1[0].itemName = this.elseItemName;
          }
          if (arr2.length) {
            arr2[0].itemName = this.elseItemName;
          }
        } else if (this.nodeLevel === 2) {
          this.thirdList.forEach(item =>
            item.prodItemLists.forEach(item2 => {
              if (item2.myId === this.changeItemNameList.myId) {
                item2.itemName = this.elseItemName;
              }
            })
          );
        }
        this.closeItemNameDialog();
      }
    },
    // 关闭弹框
    closeItemNameDialog() {
      this.changeItemNameDialog = false;
      this.changeItemNameList = {};
      this.elseItemName = "";
      this.tunnelItemName = {
        Kone: "",
        Ktwo: "",
        add1: "",
        add2: "",
        name: ""
      };
    },
    keyDown(e) {
      let key = e.key;
      if (this.changeItemNameList.isQuote === 1 || this.changeItemNameList.isQuote === 3 || this.changeItemNameList.isChooseByArea === 1) {
        e.returnValue = false;
      }
      if (key === "e" || key === "-" || key === "+") {
        e.returnValue = false;
        return false;
      }
      return true;
    },
    // 树形超过宽度提示
    onMouseEnter(str) {
      const tag = this.$refs[str];
      const parentWidth = tag.parentNode.offsetWidth; // 获取元素父级可视宽度
      const contentWidth = tag.offsetWidth; // 获取元素可视宽度
      this.isShowTooltip = contentWidth <= parentWidth;
    },
    // 临时工程设计产值输入事件
    temInput(e, row) {
      if (row.designQuantities < row.settleAmount) {
        row.designQuantities = row.settleAmount;
      }
    },
    openChangeItemCodeDialog(row) {
      this.changeItemCodeList = row;
      this.changeItemCodeDialogType = row.grade;
      this.itemCodes = row.itemCode.split("-");
      this.changeItemCodeDialog = true;
    },
    changeItemCode() {
      // if(this.treeDate)
      if (this.changeItemCodeDialogType === 1) {
        if (!this.itemCodes[0].length) {
          return this.$message.warning("请输入项目编号");
        }
      } else if (this.changeItemCodeDialogType === 2) {
        if (!this.itemCodes[1].length) {
          return this.$message.warning("请输入项目编号");
        }
      } else if (this.changeItemCodeDialogType === 3) {
        if (!this.itemCodes[2].length) {
          return this.$message.warning("请输入项目编号");
        }
      }

      if (this.itemCodes.join("-").length > 25) {
        return this.$message.warning("项目编号最大长度为25");
      }
      if (this.changeItemCodeDialogType === 1) {
        let arr = this.treeDate.filter(item => item.itemCode === this.itemCodes[0] && this.changeItemCodeList.myId !== item.myId);
        if (arr.length) {
          return this.$message.warning("列表中已有相同项目编号");
        }
        // let arr2=this.tableDate.filter(item=>item.grade===2&&this.changeItemCodeList.pid!==item.myId)
        // let arr2=
        this.treeDate.forEach(item => {
          if (item.myId === this.changeItemCodeList.myId) {
            item.prodItemLists.forEach(item2 => {
              let list = item2.itemCode.split("-");
              item2.itemCode = [this.itemCodes[0], list[1]].join("-");
              item2.prodItemLists.forEach(item3 => {
                let list2 = item3.itemCode.split("-");
                item3.itemCode = [this.itemCodes[0], list2[1], list2[2]].join("-");
              });
            });
          }
        });
      } else if (this.changeItemCodeDialogType === 2) {
        let checks = false;
        this.treeDate.forEach(item => {
          if (item.myId === this.changeItemCodeList.pid) {
            let arr = item.prodItemLists.filter(item2 => this.itemCodes.join("-") === item2.itemCode && item2.myId !== this.changeItemCodeList.myId);
            if (arr.length) {
              checks = true;
            }
            if (!checks) {
              item.prodItemLists.forEach(item2 => {
                // if (this.itemCodes.join("-") === item2.itemCode && item2.myId !== this.changeItemCodeList.myId) {
                //   checks = true;
                // }
                if (item2.myId === this.changeItemCodeList.myId) {
                  item2.prodItemLists.forEach(item3 => {
                    let list2 = item3.itemCode.split("-");
                    item3.itemCode = [this.itemCodes[0], this.itemCodes[1], list2[2]].join("-");
                  });
                }
              });
            }
            // item.prodItemLists=item.prodItemLists.sort((a,b)=>a.itemCode.localeCompare(b.itemCode))
          }
        });
        if (checks) {
          return this.$message.warning("列表中已有相同项目编号");
        }
      }
      console.log(this.itemCodes);
      this.changeItemCodeList.itemCode = this.itemCodes.join("-");
      if (this.changeItemCodeDialogType === 1) {
        this.treeDate = this.treeDate.sort((a, b) => a.itemCode - b.itemCode);
      } else if (this.changeItemCodeDialogType === 2) {
        this.treeDate.forEach(item => {
          if (item.myId === this.changeItemCodeList.pid) {
            item.prodItemLists = item.prodItemLists.sort((a, b) => {
              let arr1 = a.itemCode.split("-");
              let arr2 = b.itemCode.split("-");
              return arr1[arr1.length - 1] - arr2[arr2.length - 1];
            });
          }
        });
      } else if (this.changeItemCodeDialogType === 3) {
        this.treeDate.forEach(item => {
          item.prodItemLists.forEach(item2 => {
            if (item2.myId === this.changeItemCodeList.pid) {
              item2.prodItemLists = item2.prodItemLists.sort((a, b) => {
                let arr1 = a.itemCode.split("-");
                let arr2 = b.itemCode.split("-");
                return arr1[arr1.length - 1] - arr2[arr2.length - 1];
              });
            }
          });
        });
      }
      this.isChange = true;
      this.closeChangeItemCodeDialog();
    },
    closeChangeItemCodeDialog() {
      this.changeItemCodeDialog = false;
    },
    handleEdit() {
      this.dialogType = 2;
      this.$nextTick(() => {
        this.$refs.tables1.doLayout();
      });
    },
    positions(ref, id) {
      this.$nextTick(() => {
        this.$refs[ref].setCurrentKey(id); // 通过id高亮选中的tree节点
        let level = -1;
        let dom = this.$refs[ref].$el; // 获取 tree外层的dom
        let parentNode = this.$refs[ref].getNode(id); // 通过 id 获取 node
        console.log(parentNode);
        let nodeCount = 0; // tree中展开节点总数
        let nodeIndex = 0; // tree中选中节点

        // 获取tree节点高度
        let treeNode = document.getElementsByClassName("el-tree-node__content");
        let nodeHeight = Number(window.getComputedStyle(treeNode[0]).height.replace("px", ""));
        // let nodeHeight = Number(treeNode[0].style.height.replace('px',''))

        // 通过选中节点 获取顶层父节点 并展开
        while (level != 0) {
          this.$refs[ref].store.nodesMap[parentNode.data.myId].expanded = true;
          parentNode = parentNode.parent;
          level = parentNode.level;
        }

        // this.$nextTick(() => {
        const getNodeCount = function(val) {
          val.childNodes.forEach(e => {
            nodeCount++;
            if (e.isCurrent) {
              nodeIndex = nodeCount;
            }
            if (e.expanded) {
              getNodeCount(e);
            }
          });
        };
        getNodeCount(parentNode); // 获取展开节点总数和高亮节点位置

        // 计算 选中节点位置 并通过scrollTo方法定位
        let height = Number(window.getComputedStyle(dom).height.replace("px", ""));
        // 计算位置大约在tree中间
        if (nodeIndex * nodeHeight > 0.5 * height) {
          dom.scrollTo(0, nodeIndex * nodeHeight - 0.5 * height);
        } else {
          dom.scrollTo(0, 0);
        }
      });
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
        if (!i.prodItemLists) {
          return;
        }
        if (!i.prodItemLists.length) {
          return;
        }
        // toggleRowExpansion(i, isExpand)用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中）
        this.$refs[ref].toggleRowExpansion(i, isExpand);
        if (i.prodItemLists && i.prodItemLists.length) {
          this.forArr(i.prodItemLists, isExpand, ref);
        }
      });
    },
    expandChange(row, expend) {
      if (row.grade == 1 && expend) {
        this.forArr(row.prodItemLists, true, "tables1");
      }
    },
    filterNode1(value, data, node) {
      if (this.treeFilter1) {
        if (this.treeFilter1 == 1) {
          return !data.isNew;
        } else {
          return data.isNew;
        }
      } else {
        return true;
      }
    },
    filterNode2(value, data, node) {
      if (this.treeFilter2) {
        if (this.treeFilter2 == 1) {
          return !data.isNew;
        } else {
          return data.isNew;
        }
      } else {
        return true;
      }
    },
    filterNode3(value, data, node) {
      if (this.treeFilter3) {
        if (this.treeFilter3 == 1) {
          return !data.isNew;
        } else {
          return data.isNew;
        }
      } else {
        return true;
      }
    },
    filterNode4(value, data, node) {
      if (this.treeFilter4) {
        if (this.treeFilter4 == 1) {
          return !data.isNew;
        } else {
          return data.isNew;
        }
      } else {
        return true;
      }
    },
    filterNode5(value, data, node) {
      if (this.treeFilter5) {
        if (this.treeFilter5 == 1) {
          return !data.isNew;
        } else {
          return data.isNew;
        }
      } else {
        return true;
      }
    }
  },
  watch: {
    proManDialog(val) {
      if (val) {
        this.getItemList();
      } else {
        // this.tableDate = [];
        this.treeDate = [];
        this.clearTimer();
      }
    },
    dialogType(val) {
      if (val === 1) {
        this.clearTimer();
      } else if (val == 2) {
        this.openTimer();
      }
    },
    treeFilter1(val) {
      this.$refs.addTree1.filter();
    },
    treeFilter2(val) {
      this.$refs.tree.filter();
    },
    treeFilter3(val) {
      this.$refs.addTree2.filter();
    },
    treeFilter4(val) {
      this.$refs.tree2.filter();
    },
    treeFilter5(val) {
      this.$refs.addTree3.filter();
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
a {
  color: rgba(24, 144, 255, 1);
  // text-decoration: underline;
}
.protable {
  height: 500px;
}
.unit-quantity {
  display: flex;
}
.over {
  overflow: auto;
  max-height: 300px;
}
.form-item-item {
  display: flex;
  span {
    margin: 0 10px;
  }
  .icon {
    border: none;
  }
}
.wh-50 {
  width: 50px;
}
.add,
.remove {
  cursor: pointer;
  font-size: 20px;
  font-weight: 700;
  vertical-align: middle;
  border-radius: 50%;
}
.add {
  color: #b4c1df;
  border: 1px solid #b4c1df;
}
.remove {
  color: red;
  border: 1px solid red;
}
.itemDialog {
  display: flex;
  .header {
    display: flex;
    align-items: center;
    height: 52px;
    // line-height: 52px;
    padding-left: 10px;
    background-color: #e9e9e9;
    font-size: 14px;
    font-weight: 500;
    // border-bottom: 1px solid #d7d7d7;
    border-radius: 13px 13px 0px 0px;
    background: rgba(241, 246, 255, 1);
  }
  .hasSel {
    justify-content: space-between;
  }
  .itemDialog-left {
    position: relative;
    width: 500px;
    // border: 1px solid #d7d7d7;
    border-radius: 13px 13px 0px 0px;
    box-shadow: 0px 2px 4px 0px rgba(27, 60, 78, 0.1);
    .main {
      // margin: 5px 10px;
      .el-tree-node__content {
        position: relative;
      }
      .cellList {
        height: 500px;
        overflow: auto;
        .cellItem {
          position: relative;
          padding: 10px 0;
          padding-left: 5px;
          border: 1px solid #e5ecfa;
          .add {
            top: 50%;
            transform: translateY(-50%);
          }
        }
        .label {
          display: block;
          width: 380px;
          overflow: hidden; /*超出部分隐藏*/
          white-space: nowrap; /*禁⽌换⾏*/
          text-overflow: ellipsis; /*省略号*/
          font-size: 16px;
        }
      }
      .add {
        position: absolute;
        right: 40px;
        z-index: 2;
        background-color: #fff;
      }
    }
  }
  .itemDialog-middle {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    i {
      font-size: 50px;
      font-weight: 700;
    }
  }
  .itemDialog-right {
    width: 500px;
    // border: 1px solid #d7d7d7;
    border-radius: 13px 13px 0px 0px;
    box-shadow: 0px 2px 4px 0px rgba(27, 60, 78, 0.1);
    // .el-tree {
    //   // margin: 5px;
    //   .el-input {
    //     margin: 5px 0;
    //   }
    // }
  }
  .itemDialog-center {
    flex: 1;
    border: 1px solid #d7d7d7;
  }
  /deep/ .el-tree {
    width: 100%;
    height: 500px;
    overflow: auto;
    // 不可全选样式
    .el-tree-node {
      .is-leaf + .el-checkbox .el-checkbox__inner {
        display: inline-block;
      }
      .el-checkbox .el-checkbox__inner {
        display: none;
      }
    }
    .main-item {
      position: relative;
      width: 420px;
      .label {
        display: block;
        width: 350px;
        overflow: hidden; /*超出部分隐藏*/
        white-space: nowrap; /*禁⽌换⾏*/
        text-overflow: ellipsis; /*省略号*/
      }
      .add {
        top: 50%;
        transform: translateY(-50%);
      }
    }
    .isNew {
      color: #1890ff;
    }
    .label1 {
      width: 400px;
      overflow: hidden; /*超出部分隐藏*/
      white-space: nowrap; /*禁⽌换⾏*/
      text-overflow: ellipsis; /*省略号*/
    }
    .label2 {
      width: 380px;
      overflow: hidden; /*超出部分隐藏*/
      white-space: nowrap; /*禁⽌换⾏*/
      text-overflow: ellipsis; /*省略号*/
    }
    .label3 {
      width: 360px;
      overflow: hidden; /*超出部分隐藏*/
      white-space: nowrap; /*禁⽌换⾏*/
      text-overflow: ellipsis; /*省略号*/
    }
    .label4 {
      width: 350px;
      overflow: hidden; /*超出部分隐藏*/
      white-space: nowrap; /*禁⽌换⾏*/
      text-overflow: ellipsis; /*省略号*/
    }
    .el-tree-node__content {
      .psr {
        position: relative;
      }
      .operate {
        display: flex;
        align-items: center;
        position: absolute;
        top: 2px;
        left: 200px;
        .edit {
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          margin-right: 5px;
          width: 25px;
          height: 25px;
          vertical-align: middle;
          border-radius: 50%;
          font-size: 18px;
          color: #fff;
          background-color: rgba(24, 144, 255, 1);
        }
        .treeRemove {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 23px;
          height: 23px;
          border: 1px solid red;
          background-color: red;
          color: #fff;
        }
      }
      .el-input {
        width: 180px;
      }
      .showNode {
        width: 180px;
        height: 28px;
        line-height: 28px;
        overflow: hidden; /*超出部分隐藏*/
        white-space: nowrap; /*禁⽌换⾏*/
        text-overflow: ellipsis; /*省略号*/
      }
    }
  }
  ::-webkit-scrollbar {
    height: 8px;
  }
  ::-webkit-scrollbar-track-piece {
    height: 8px;
    border-radius: 10px;
    background-color: #eef1f3;
  }
  ::-webkit-scrollbar-thumb {
    height: 8px;
    border-radius: 10px;
    background-color: #cbcfd2;
    background-clip: padding-box;
  }
}
.can-box {
  height: 550px;
  overflow: auto;

  .pre-can {
    height: 529px;
    text-align: center;
    overflow: hidden;
  }
  .pre-name {
    font-size: 16px;
    font-weight: 700;
  }
}
.itemName {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  // margin-top: 10px;
  // margin-bottom: 10px;
  background-color: #333333;
  color: #fff;
  .wh-350 {
    width: 450px;
  }
  .tunnel {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 450px;
    .name {
      width: 200px;
    }
    .K {
      width: 40px;
    }
    .add1 {
      width: 50px;
    }
    .str {
      vertical-align: middle;
    }
    /deep/ .el-input {
      .el-input__inner {
        padding: 0;
      }
    }
  }
  .changeItemName {
    margin-left: 10px;
  }
}
.wh-80per {
  width: 80%;
}
.itemCode {
  display: flex;
  // padding: 10px 0;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  background-color: #333333;
  color: #fff;
  .itemCode-content {
    display: flex;
  }
  .str {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 36px;
    vertical-align: middle;
  }
  .line {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    vertical-align: middle;
  }
  /deep/ .el-input {
    flex: 1;
    .el-input__inner {
      padding: 0;
    }
  }
  .changeItemCode {
    margin-left: 10px;
  }
}
.delheader {
  /deep/ .el-dialog__header,
  .el-dialog__headerbtn {
    display: none;
  }
}
.export {
  background-color: #8080ff;
}
</style>
