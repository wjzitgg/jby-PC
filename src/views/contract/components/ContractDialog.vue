<template>
  <div>
    <!-- 模态框 -->
    <el-dialog :close-on-press-escape="false" top="30px" :title="dialogShowType == 1 ? '合同信息' : dialogShowType == 2 ? '新增合同' : '编辑合同'" :visible="dialogVisible" @close="handleClose(false)" v-loading="loading" v-dialogDrag :close-on-click-modal="false" custom-class="custom-dialog">
      <div class="dialog-form" :style="{ paddingTop: dialogShowType == 1 ? '90px' : '40px' }">
        <div class="header" v-if="dialogShowType == 1">
          <h3>{{ addContractDate.contractName }}</h3>
          <div class="print-export">
            <!-- v-has="'production:process:out'"
v-has="'production:process:put'" -->
            <el-button type="primary" v-if="id == 1" v-has="'contract:construction:out'" class="el-button-primary educe" size="mini" @click="dataExport">导出</el-button>
            <el-button type="primary" v-if="id == 2" v-has="'contract:supervisor:out'" class="el-button-primary educe" size="mini" @click="dataExport">导出</el-button>
            <el-button type="primary" v-if="id == 3" v-has="'contract:supplier:out'" class="el-button-primary educe" size="mini" @click="dataExport">导出</el-button>
            <el-button type="primary" v-if="id == 4" v-has="'contract:subcontractor:out'" class="el-button-primary educe" size="mini" @click="dataExport">导出</el-button>

            <el-button type="primary" v-if="id == 1" v-has="'contract:construction:put'" class="el-button-primary" size="mini" @click="dataPrinting">打印</el-button>
            <el-button type="primary" v-if="id == 2" v-has="'contract:supervisor:put'" class="el-button-primary" size="mini" @click="dataPrinting">打印</el-button>
            <el-button type="primary" v-if="id == 3" v-has="'contract:supplier:put'" class="el-button-primary" size="mini" @click="dataPrinting">打印</el-button>
            <el-button type="primary" v-if="id == 4" v-has="'contract:subcontractor:put'" class="el-button-primary" size="mini" @click="dataPrinting">打印</el-button>
          </div>
        </div>
        <div class="baseInfo">
          <div class="main">
            <div class="main-model">
              <div class="main-item" v-if="dialogShowType != 1">
                <span class="labe-title">合同名称</span>
                <el-input size="mini" :disabled="dialogShowType === 1" v-model.trim="addContractDate.contractName" maxlength="50" @input="showInpKey"></el-input>
              </div>
              <div class="main-item">
                <span class="labe-title">合同编号</span>
                <el-input size="mini" onkeyup="value=value.replace(/[\u4E00-\u9FA5]/g,'')" :disabled="dialogShowType === 1 || allowModifyStatus" v-model="contractNumber" maxlength="50"></el-input>
              </div>
            </div>
            <div class="main-model">
              <!-- <div class="main-item">
                <span>合同名称</span>
                <el-input size="mini" :class="{ 'wh-200': this.id == 2, 'wh-250': this.id != 2 }" :disabled="dialogShowType === 1" v-model="addContractDate.contractName" maxlength="50"></el-input>
              </div> -->
              <div class="main-item" v-if="id == 2">
                <span class="labe-title">{{ contracter }}</span>
                <el-input size="mini" v-if="dialogShowType === 1 || (dialogShowType === 3 && user.orgType === 3)" :value="user.orgType === 3 ? addContractDate.projectName : addContractDate.supervisionName" disabled></el-input>
                <el-select size="mini" v-else :disabled="user.orgType === 5 && id === 1" v-model="addContractDate.fkProjectId" @change="contraChange">
                  <el-option v-for="item in constructionUnits" :key="item.pkId" :value="item.pkId" :label="item.projectName"></el-option>
                </el-select>
              </div>
              <div class="main-item" v-else>
                <span class="labe-title">{{ contracter }}</span>
                <el-input size="mini" v-if="dialogShowType === 1 || (dialogShowType === 3 && user.orgType === 3)" v-model="addContractDate.customerOrgName" disabled></el-input>
                <el-select size="mini" v-else :disabled="user.orgType === 5 && id === 1" v-model="addContractDate.fkCustomerId" @change="contraChange">
                  <el-option v-for="item in constructionUnits" :key="item.pkId" :value="item.pkId" :label="item.customName"></el-option>
                </el-select>
              </div>

              <div class="main-item" v-show="id === 2">
                <span class="labe-title">建设单位</span>
                <el-input size="mini" disabled v-model="addContractDate.customerOrgName"></el-input>
              </div>
              <div class="main-item" v-show="id === 2">
                <span class="labe-title">施工单位</span>
                <el-input size="mini" disabled v-model="addContractDate.superiorOrgName"></el-input>
              </div>
              <div class="main-item" v-if="id !== 2">
                <span class="labe-title">合同金额</span>
                <el-input size="mini" disabled v-model="contentAmount" v-if="pricePermission && dialogShowType != 1"> <span slot="suffix" style="line-height: 40px;">元</span></el-input>
                <el-input size="mini" disabled :value="pricePermission == true ? this.contentAmount : '****'" v-else></el-input>
              </div>
              <div class="main-item">
                <span class="labe-title">合同签订日期</span>
                <el-date-picker value-format="yyyy-MM-dd" size="mini" type="date" :disabled="dialogShowType === 1" v-model="addContractDate.signDate"> </el-date-picker>
              </div>
            </div>
            <div class="main-model">
              <div class="main-item" v-if="pricePermission && id === 2">
                <span class="labe-title">合同金额</span>
                <el-input size="mini" disabled v-model="contentAmount"><span slot="suffix" style="line-height: 40px;">元</span></el-input>
              </div>

              <div class="main-item" v-if="id !== 3">
                <span class="labe-title">施工开始日期</span>
                <el-date-picker value-format="yyyy-MM-dd" size="mini" type="date" :disabled="dialogShowType === 1" v-model="addContractDate.beginDate"> </el-date-picker>
              </div>
              <div class="main-item" v-if="id !== 3">
                <span class="labe-title">施工完成日期</span>
                <el-date-picker value-format="yyyy-MM-dd" size="mini" type="date" :disabled="dialogShowType === 1" v-model="addContractDate.endDate"> </el-date-picker>
              </div>
              <div class="main-item" v-if="id !== 3 && id !== 2">
                <span class="labe-title">结算税点</span>
                <el-input size="mini" :disabled="dialogShowType === 1" v-model.trim="addContractDate.taxRate" oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')" @blur="addContractDate.taxRate = $event.target.value"><span slot="suffix" style="line-height: 40px;" class="el-input__icon">%</span></el-input>
              </div>
              <div class="main-item" v-if="id === 2">
                <span class="labe-title">结算税点</span>
                <el-input size="mini" :disabled="dialogShowType === 1" v-model.trim="addContractDate.taxRate" oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')" @blur="addContractDate.taxRate = $event.target.value"><span slot="suffix" style="line-height: 40px;">%</span></el-input>
              </div>
            </div>
            <div class="main-model" v-if="(attachments.length && dialogShowType === 1) || dialogShowType !== 1">
              <div class="main-item" v-if="dialogShowType != 1">
                <span class="labe-title">合同附件</span>
                <span class="project-img-btn" v-show="dialogShowType != 1"><input type="file" id="upload" ref="file" class="filebtn" accept="application/pdf" @change="upLoad" /> 请上传</span>
                <!-- attachName:filename,attachUrl:path,suffix:typeName -->
              </div>
              <div class="main-item3">
                <div class="labe-title3" v-if="dialogShowType == 1">合同附件</div>
                <span v-for="(item, idx) in attachments" :key="idx" class="suee-text">
                  <!-- <i class="el-icon-link"></i> -->
                  <!-- 主合同文件 -->
                  <el-tooltip :content="item.attachName" placement="top">
                    <span @click="preview(item.attachUrl)" class="attachName">{{ item.attachName }}</span>
                  </el-tooltip>
                  <!-- <span class="del" @click="delAttach(item)" v-show="dialogShowType != 1">X</span> -->
                  <el-button size="mini" @click="download(item)" type="success" plain class="dowl">下载</el-button>
                  <i class="el-icon-delete del" @click="delAttach(item)" v-show="dialogShowType != 1"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="listInfo" v-if="[1, 2].includes(id)">
          <!-- <div class="header">
          <el-button size="mini" class="el-button-primary" type="primary" @click="handleOpen(2)" v-if="dialogShowType === 2 || dialogShowType === 3">新增清单</el-button>
        </div> -->
          <!-- @change="tabsChange" -->
          <!-- <el-button size="mini" class="el-button-primary add-inventory" type="primary" v-show="tabsList.length != 0" @click="handleOpen(2)" v-if="dialogShowType === 2 || dialogShowType === 3">新增清单</el-button> -->
          <el-tabs v-model="tabs" type="card" :before-leave="beforeLeave" :class="{ tabSign: dialogShowType != 1 }" style="position: relative">
            <!-- :closable="dialogShowType === 2 || dialogShowType === 3"  -->
            <el-tab-pane :name="item.chapterName" :label="item.chapterName" v-for="(item, index) in tabsList" :key="index">
              <span slot="label">
                <el-tooltip class="item" effect="dark" :content="item.chapterName" placement="top">
                  <div class="container">{{ item.chapterName }}</div>
                </el-tooltip>
                <el-dropdown @command="handleCommand" v-if="tabs == item.chapterName && dialogShowType != 1">
                  <i class="el-icon-more"></i>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="index">编辑</el-dropdown-item>
                    <el-dropdown-item command="del">删除</el-dropdown-item>
                    <el-dropdown-item divided command="add">新增清单</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </span>
              <div class="main">
                <el-table stripe :header-cell-style="{ background: '#f1f6ff' }" :data="item.details" style="width: 100%" height="100%" :key="randeKeys">
                  <el-table-column align="center" label="子目号" prop="subitemNum" width="80" show-overflow-tooltip></el-table-column>
                  <el-table-column align="center" label="清单名称" prop="detailName" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                      <div :title="row.detailName">{{ row.detailName }}</div>
                    </template>
                  </el-table-column>
                  <!-- <el-table-column align="center" label="清单类型">
                    <template slot-scope="{ row }" :cleanRed="row">
                      {{ item.pkId !== "inventory_cost" ? "施工类清单" : "费用类清单" }}
                    </template>
                  </el-table-column> -->
                  <el-table-column align="center" v-if="item.pkId !== 'inventory_cost'" label="单位" prop="unitName" show-overflow-tooltip> </el-table-column>
                  <el-table-column align="center" v-if="item.pkId !== 'inventory_cost'" label="数量" prop="contractNum" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                      <span v-if="row.quantities != undefined && row.quantities != null && row.quantities != ''">{{ row.quantities }}</span>
                      <span v-else>{{ row.inventoryCode == "inventory_itemize" && row.contractNum == 0 ? "" : row.contractNum }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column align="center" v-if="item.pkId !== 'inventory_cost' && pricePermission" label="单价" prop="price" show-overflow-tooltip></el-table-column>
                  <el-table-column align="center" label="合价" prop="amount" v-if="pricePermission" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                      <span>{{ row.inventoryCode == "inventory_itemize" && row.amount == 0 ? "" : row.amount }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column align="center" label="备注" prop="remark" show-overflow-tooltip></el-table-column>
                  <el-table-column align="center" label="操作" width="250">
                    <template slot-scope="{ row, $index }">
                      <!--  -->
                      <el-button plain size="mini" @click="handleOpen(1, row, $index)" type="primary">查看</el-button>
                      <el-button plain size="mini" @click="handleOpen(3, row, $index)" v-show="dialogShowType != 1 && row.isAppearUpdate">编辑</el-button>
                      <el-button plain size="mini" @click="handleDel(row, $index)" v-show="dialogShowType != 1 && row.isDelete" type="danger">删除</el-button>
                    </template>
                  </el-table-column>
                  <div class="empty" style="width: 100%; height: 100%">
                    <img src="@/assets/empty.svg" class="zanwu" />
                    <span>暂无数据</span>
                  </div>
                </el-table>
              </div>
            </el-tab-pane>
            <!-- <el-button type="primary" size="mini" icon="el-icon-plus" @click="addChapter"></el-button>  -->
            <!-- <el-tab-pane name="chapter-add" label="+" style="font-size: 22px" @click="addChapter"> </el-tab-pane> -->
            <el-tab-pane key="add" name="add" v-if="dialogShowType === 2 || dialogShowType === 3">
              <span slot="label" style="padding: 8px; font-weight: bold; color: #2a82e4"> <span style="font-size: 20px;">＋</span> 添加章节</span>
            </el-tab-pane>
          </el-tabs>
          <div class="main" v-if="!tabsList.length">
            <div class="empty" style="width: 100%; height: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </div>
        </div>
        <div class="listInfo" v-if="id === 3">
          <!-- <div class="header"><span>物料信息</span></div> -->
          <el-tabs v-model="materialType" type="card">
            <el-tab-pane label="工程材料" name="2"></el-tab-pane>
            <el-tab-pane label="其他材料" name="3"></el-tab-pane>
          </el-tabs>
          <div class="main">
            <!-- 表单 -->
            <!-- inventoryType -->
            <el-table stripe :header-cell-style="{ background: '#f1f6ff' }" :data="materialList" style="width: 100%" height="100%" :key="randeKeys">
              <el-table-column align="center" label="子目号" width="100">
                <template slot-scope="{ row }">
                  <el-input v-if="dialogShowType !== 1" v-model="row.subitemNum" size="mini" @focus="openChangeItemCodeDialog(row, 1)"></el-input>
                  <span v-else>{{ row.subitemNum }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" label="物料名称" prop="detailName">
                <template slot-scope="{ row }">
                  <el-input size="mini" :value="row.detailName" placeholder="点击选择物料" class="selectFac" @focus="selectMater(row)" v-if="dialogShowType !== 1">
                    <el-button slot="append" icon="el-icon-more" @click="selectMater(row)" size="mini"></el-button>
                  </el-input>
                  <div class="ellipsistwo" v-else :title="row.detailName">{{ row.detailName }}</div>
                </template>
              </el-table-column>
              <el-table-column align="center" label="物料分类" prop="fkTypeName" v-if="id !== 3" show-overflow-tooltip></el-table-column>
              <el-table-column align="center" label="单位" prop="unitName" width="100" show-overflow-tooltip> </el-table-column>
              <el-table-column align="center" :label="id === 3 ? '供货数量' : '合同数量'" prop="contractNum" show-overflow-tooltip>
                <template slot-scope="{ row }">
                  <el-input
                    v-if="dialogShowType !== 1 && row.fkMaterialId != 0"
                    :class="{ red: redList.includes(row.fkMaterialId) && !row.contractNum }"
                    v-model="row.contractNum"
                    size="mini"
                    oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,6})?).*$/g, '$1')"
                    @input="materPriceInput(row)"
                    @blur="
                      row.contractNum = $event.target.value;
                      (row.contractNum - 0) * (row.price - 0) ? (row.amount = ((row.contractNum - 0) * (row.price - 0)).toFixed(2) - 0) : (row.amount = 0);
                    "
                  ></el-input>
                  <span v-else>{{ row.inventoryCode == "inventory_itemize" && row.contractNum == 0 ? "" : row.contractNum }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" label="单价" prop="price" v-if="pricePermission" show-overflow-tooltip>
                <template slot-scope="{ row }">
                  <el-input
                    v-if="dialogShowType !== 1 && row.fkMaterialId != 0"
                    :class="{ red: redList.includes(row.fkMaterialId) && !row.price }"
                    v-model="row.price"
                    size="mini"
                    oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')"
                    @input="materPriceInput(row)"
                    @blur="
                      row.price = $event.target.value;
                      (row.contractNum - 0) * (row.price - 0) ? (row.amount = ((row.contractNum - 0) * (row.price - 0)).toFixed(2) - 0) : (row.amount = 0);
                    "
                  ></el-input>
                  <span v-else>{{ row.price }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" label="总额" prop="amount" v-if="pricePermission" show-overflow-tooltip>
                <template slot-scope="{ row }">
                  {{ row.fkMaterialId != 0 ? row.amount : "" }}
                </template>
              </el-table-column>
              <el-table-column align="center" label="备注" prop="remark" show-overflow-tooltip>
                <template slot-scope="{ row }">
                  <el-input v-model="row.remark" size="mini" maxlength="100" v-if="dialogShowType !== 1 && row.fkMaterialId != 0"></el-input>
                  <span v-else>{{ row.remark }}</span>
                </template>
              </el-table-column>
              <el-table-column align="center" label="操作" width="100" v-if="dialogShowType !== 1">
                <template slot-scope="{ row, $index }">
                  <span plain class="addAcc el-icon-plus" v-if="materialList.length == $index + 1" @click="addMater(1)" title="添加"> </span>
                  <span plain class="delAcc el-icon-close" v-if="row.isDelete" @click="delMater(row, $index, 1)" title="删除"> </span>
                </template>
              </el-table-column>
              <div slot="empty" class="empty" style="width: 100%">
                <img src="@/assets/empty.svg" class="zanwu" />
                <span>暂无数据</span>
              </div>
            </el-table>
          </div>
        </div>
        <div class="listInfo" v-if="id === 4">
          <div class="radios">
            <el-radio-group v-model="radio1">
              <el-radio-button :label="1">清单项目</el-radio-button>
              <el-radio-button :label="2">供应材料</el-radio-button>
            </el-radio-group>
            <el-button class="addbtn el-button-primary" size="mini" v-show="tabsList.length != 0" type="primary" @click="handleOpen(2)" v-if="[2, 3].includes(dialogShowType) && radio1 === 1">新增清单</el-button>
          </div>
          <!-- 清单项目 -->
          <!-- @change="tabsChange" -->
          <el-tabs v-model="tabs" type="card" v-if="radio1 === 1" :before-leave="beforeLeave" :closable="dialogShowType === 2 || dialogShowType === 3" @tab-remove="removeTab">
            <el-tab-pane :name="item.chapterName" v-for="(item, index) in tabsList" :key="index">
              <span slot="label" @dblclick="dblclick(item, index)">
                <el-tooltip class="item" effect="dark" :content="item.chapterName" placement="top">
                  <div class="container">{{ item.chapterName }}</div>
                </el-tooltip>
              </span>
              <div class="main">
                <el-table stripe :header-cell-style="{ background: '#f1f6ff' }" :data="item.details" style="width: 100%" height="100%" :key="randeKeys">
                  <el-table-column align="center" label="子目号" prop="subitemNum" width="80" show-overflow-tooltip></el-table-column>
                  <el-table-column align="center" label="清单名称" prop="detailName">
                    <template slot-scope="{ row }">
                      <div class="ellipsistwo" :title="row.detailName">{{ row.detailName }}</div>
                    </template>
                  </el-table-column>
                  <!-- <el-table-column align="center" label="清单类型">
                  <template slot-scope="{ row }" :cleanRed="row">
                    {{ item.pkId !== "inventory_cost" ? "施工类清单" : "费用类清单" }}
                  </template>
                </el-table-column> -->
                  <el-table-column align="center" v-if="item.pkId !== 'inventory_cost'" label="单位" prop="unitName" show-overflow-tooltip> </el-table-column>
                  <el-table-column align="center" v-if="item.pkId !== 'inventory_cost'" label="合同数量" prop="contractNum" show-overflow-tooltip>
                    <!-- quantities -->
                    <template slot-scope="{ row }">
                      <span v-if="row.quantities != undefined && row.quantities != null && row.quantities != ''">{{ row.quantities }}</span>
                      <span v-else>{{ row.inventoryCode == "inventory_itemize" && row.contractNum == 0 ? "" : row.contractNum }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column align="center" v-if="item.pkId !== 'inventory_cost' && pricePermission" label="清单价" prop="price" show-overflow-tooltip></el-table-column>
                  <el-table-column align="center" label="合价" prop="amount" v-if="pricePermission" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                      <span>{{ row.inventoryCode == "inventory_itemize" && row.amount == 0 ? "" : row.amount }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column align="center" label="备注" prop="remark" show-overflow-tooltip></el-table-column>
                  <el-table-column align="center" label="操作" width="250">
                    <template slot-scope="{ row, $index }">
                      <el-button plain size="mini" @click="handleOpen(1, row, $index)" type="primary">查看</el-button>
                      <el-button plain size="mini" @click="handleOpen(3, row, $index)" v-show="dialogShowType != 1 && row.isAppearUpdate">编辑</el-button>
                      <el-button plain size="mini" @click="handleDel(row, $index)" v-show="dialogShowType != 1 && row.isDelete" type="danger">删除</el-button>
                    </template>
                  </el-table-column>
                  <div class="empty" style="width: 100%; height: 100%">
                    <img src="@/assets/empty.svg" class="zanwu" />
                    <span>暂无数据</span>
                  </div>
                </el-table>
              </div>
            </el-tab-pane>
            <el-tab-pane key="add" name="add" v-if="[2, 3].includes(dialogShowType) && radio1 === 1">
              <span slot="label" style="padding: 8px; font-weight: bold"> <span style="font-size: 20px; color: #81b603">＋</span> 新增清单章节 </span>
            </el-tab-pane>
          </el-tabs>
          <div class="main" v-if="radio1 === 1 && !tabsList.length">
            <div class="empty" style="width: 100%; height: 100%">
              <img src="@/assets/empty.svg" class="zanwu" />
              <span>暂无数据</span>
            </div>
          </div>
          <!-- 物料信息 -->
          <el-tabs v-model="tabs2" type="card" v-if="radio1 === 2">
            <el-tab-pane v-for="item in tabs2List" :key="item.value" :name="item.value" :label="item.label">
              <div class="main">
                <el-table border :data="materialShowList" style="width: 100%" height="100%" :key="randeKeys">
                  <el-table-column align="center" label="子目号" width="100" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                      <el-input v-if="dialogShowType !== 1" v-model="row.subitemNum" @focus="openChangeItemCodeDialog(row, 2)" size="mini"></el-input>
                      <span v-else>{{ row.subitemNum }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column align="center" label="材料名称" prop="materialName">
                    <template slot-scope="{ row }">
                      <el-input size="mini" :value="row.materialName" placeholder="点击选择物料" class="selectFac" @focus="selectMater(row)" v-if="dialogShowType !== 1">
                        <el-button slot="append" icon="el-icon-more" @click="selectMater(row)" size="mini"></el-button>
                      </el-input>
                      <div class="ellipsistwo" :title="row.materialName" v-else>{{ row.materialName }}</div>
                    </template>
                  </el-table-column>
                  <el-table-column align="center" label="材料类别" prop="materialTypeName" show-overflow-tooltip></el-table-column>
                  <el-table-column align="center" label="单位" prop="unitName" show-overflow-tooltip> </el-table-column>
                  <!-- supply_other -->
                  <el-table-column align="center" label="供应数量" prop="supplyNum" v-if="['supply_deduction', 'supply_other'].includes(tabs2)" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                      <el-input v-if="dialogShowType !== 1 && row.fkMaterialId != 0" :class="{ red: redList.includes(row.fkMaterialId) && !row.supplyNum }" v-model="row.supplyNum" size="mini" oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,6})?).*$/g, '$1')" @blur="row.supplyNum = $event.target.value"></el-input>
                      <span v-else>{{ row.supplyNum }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column align="center" label="超额比例" prop="supplyNum" v-if="tabs2 == 'supply_noDeduction'" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                      <el-input v-if="dialogShowType !== 1 && row.fkMaterialId != 0" v-model="row.supplyNum" size="mini" oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,6})?).*$/g, '$1')" @blur="row.supplyNum = $event.target.value">
                        <template slot="append">%</template>
                      </el-input>
                      <span v-else>{{ row.supplyNum }} <span v-if="row.fkMaterialId != 0">%</span></span>
                    </template>
                  </el-table-column>
                  <el-table-column align="center" label="超额扣款单价" prop="supplyPrice" v-if="tabs2 == 'supply_noDeduction'" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                      <el-input v-if="dialogShowType !== 1 && row.fkMaterialId != 0" v-model="row.excessPrice" size="mini" oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')" @blur="row.excessPrice = $event.target.value"></el-input>
                      <span v-else>{{ row.excessPrice }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column align="center" label="供应单价" prop="supplyPrice" v-if="['supply_deduction', 'supply_other'].includes(tabs2) && pricePermission" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                      <el-input v-if="dialogShowType !== 1 && row.fkMaterialId != 0" :class="{ red: redList.includes(row.fkMaterialId) && !row.supplyPrice }" v-model="row.supplyPrice" size="mini" oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')" @blur="row.supplyPrice = $event.target.value"></el-input>
                      <span v-else>{{ row.supplyPrice }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column align="center" label="供应总额" v-if="['supply_deduction', 'supply_other'].includes(tabs2) && pricePermission" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                      {{ (row.supplyPrice - 0) * (row.supplyNum - 0) ? ((row.supplyPrice - 0) * (row.supplyNum - 0)).toFixed(2) - 0 : "" }}
                    </template>
                  </el-table-column>
                  <el-table-column align="center" label="备注" prop="remark" show-overflow-tooltip>
                    <template slot-scope="{ row }">
                      <el-input v-if="dialogShowType !== 1 && row.fkMaterialId != 0" v-model="row.remark" size="mini" maxlength="100"></el-input>
                      <span v-else>{{ row.remark }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column align="center" label="操作" width="100" v-if="dialogShowType !== 1">
                    <template slot-scope="{ row, $index }">
                      <span class="addAcc el-icon-plus" v-if="materialShowList.length == $index + 1" @click="addMater(tabs2 === 'supply_noDeduction' ? 2 : tabs2 == 'supply_deduction' ? 3 : 4)" title="添加"> </span>
                      <span class="delAcc el-icon-close" @click="delMater(row, $index, tabs2 === 'supply_noDeduction' ? 2 : tabs2 == 'supply_deduction' ? 3 : 4)" title="删除"> </span>
                    </template>
                  </el-table-column>
                  <div class="empty" slot="empty" style="width: 100%; height: 100%">
                    <img src="@/assets/empty.svg" class="zanwu" />
                    <span>暂无数据</span>
                  </div>
                </el-table>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <span slot="footer" class="dialog-footer" v-if="dialogShowType !== 1">
        <el-button size="mini" class="btns btn-cols" @click="handleClose(false)">取 消</el-button>
        <el-button size="mini" class="btns " type="primary" @click="submit">保 存</el-button>
      </span>
    </el-dialog>
    <!-- 工程清单信息模态框 -->
    <el-dialog top="3vw" :close-on-press-escape="false" title="清单信息" :visible="listInfoDialog" @close="handleClose2" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form" v-if="dopeSheet.inventoryCode != 'inventory_itemize'">
        <div class="listDialog">
          <div class="listDialog-left" :style="{ width: dopeSheet.inventoryCode === 'inventory_cost' ? '100%' : '' }">
            <el-form label-width="100px">
              <!-- <el-form-item :label="quanxian == 1 || (dialogShowType != 2 && quanxian == 3) ? '物料名称' : '选择物料'" v-if="id === 3">
              <el-input size="mini" :value="dopeSheet.detailName" disabled v-if="quanxian == 1 || (dialogShowType != 2 && quanxian == 3)"></el-input>
              <el-cascader size="mini" style="width: 100%" :options="options" :props="setProps" @change="cascaderChange" :emitPath="false" v-model="material" filterable ref="cascader" v-else></el-cascader>
            </el-form-item> -->
              <el-form-item label="清单类型" v-if="[1, 2, 4].includes(id)">
                <el-select v-model="dopeSheet.inventoryCode" @change="detailTypeChange" size="mini" style="width: 100%" :disabled="quanxian !== 2 || !dopeSheet.isUpdate">
                  <el-option v-for="item in listType" :key="item.value" :value="item.value" :label="item.label"> </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="专业类别" v-if="[1, 2, 4].includes(id) && dopeSheet.inventoryCode === 'inventory_build'">
                <el-select v-model="major" size="mini" style="width: 100%" :disabled="quanxian === 1 || !dopeSheet.isUpdate" @change="majorChange">
                  <!-- <el-option value="" label="全部" v-if="id !== 4"></el-option> -->
                  <el-option v-for="item in majorTypeList" :key="item.pkId" :value="item.pkId" :label="item.engTypeName"> </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="子目号" v-if="[1, 2, 4].includes(id)">
                <el-input oninput="this.value = this.value.replace(/[^0-9]/g, '');" v-model="dopeSheet.subitemNum" :disabled="quanxian === 1 || !dopeSheet.isUpdate" size="mini" :maxlength="25" @focus="openChangeItemCodeDialog(dopeSheet, 3)"></el-input>
              </el-form-item>
              <el-form-item label="清单名称" v-if="[1, 2, 4].includes(id)">
                <el-input v-model="dopeSheet.detailName" :disabled="quanxian === 1 || !dopeSheet.isUpdate" size="mini" :maxlength="25"></el-input>
              </el-form-item>
              <el-form-item label="合同数量" v-if="dopeSheet.inventoryCode !== 'inventory_cost'">
                <el-input v-model="dopeSheet.contractNum" :disabled="quanxian === 1 || !dopeSheet.isUpdate" size="mini" type="number" @keydown.native="channelInputLimit($event, 1)" @input="oninput3" onmousewheel="return false;" :maxlength="moneyMaxLeng2"></el-input>
              </el-form-item>
              <el-form-item label="设计数量" v-if="[1, 2, 4].includes(id) && dopeSheet.inventoryCode === 'inventory_build' && dopeSheet.itemIds.length">
                <el-input v-model="dopeSheet.quantities" disabled size="mini"></el-input>
              </el-form-item>
              <el-form-item label="单位">
                <el-autocomplete v-if="dopeSheet.inventoryCode !== 'inventory_cost'" v-model="unitSea" size="mini" :disabled="quanxian === 1 || !dopeSheet.isUpdate" style="width: 100%" @select="unitSelect" :fetch-suggestions="unitSearch" @blur="unitBlur">
                  <!-- <el-option v-for="item in unitData" :key="item.pkId" :label="item.unitName" :value="item.pkId"> </el-option> -->
                  <template slot-scope="{ item }">
                    <div>{{ item.unitName }}</div>
                  </template>
                </el-autocomplete>
                <el-autocomplete v-else v-model="unitSea" size="mini" :disabled="quanxian === 1 || !dopeSheet.isUpdate" style="width: 100%" @select="unitSelect" :fetch-suggestions="unitSearchs" @blur="unitBlur">
                  <!-- <el-option v-for="item in unitData" :key="item.pkId" :label="item.unitName" :value="item.pkId"> </el-option> -->
                  <template slot-scope="{ item }">
                    <div>{{ item.unitName }}</div>
                  </template>
                </el-autocomplete>
              </el-form-item>
              <el-form-item label="清单价" v-if="dopeSheet.inventoryCode !== 'inventory_cost' && pricePermission">
                <el-input v-model="dopeSheet.price" :disabled="quanxian === 1 || !dopeSheet.isUpdate" size="mini" @keydown.native="channelInputLimit($event, 1)" @input="oninput2($event, 2)" :maxlength="moneyMaxLeng"></el-input>
              </el-form-item>
              <el-form-item label="清单总额" v-if="dopeSheet.inventoryCode !== 'inventory_cost' && pricePermission">
                <el-input v-if="[1, 2, 4].includes(id) && dopeSheet.inventoryCode === 'inventory_build' && dopeSheet.itemIds.length" :value="amount3" disabled size="mini" type="number"></el-input>
                <el-input v-else :value="amount" disabled size="mini" type="number"></el-input>
              </el-form-item>
              <el-form-item label="清单总额" v-if="dopeSheet.inventoryCode === 'inventory_cost' && pricePermission">
                <el-input v-model="dopeSheet.amount" size="mini" :disabled="quanxian === 1 || !dopeSheet.isUpdate" oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')" @blur="dopeSheet.amount = $event.target.value" @input="secondInput" :maxlength="secondMaxLength"></el-input>
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="dopeSheet.remark" :disabled="quanxian === 1 || !dopeSheet.isUpdate" resize="none" type="textarea" rows="4" :maxlength="100"></el-input>
              </el-form-item>
            </el-form>
          </div>
          <div class="listDialog-right" v-if="([1, 2].includes(id) && this.dopeSheet.inventoryCode !== 'inventory_cost') || (id === 4 && radio1 === 1 && this.dopeSheet.inventoryCode !== 'inventory_cost')">
            <div class="flex" v-if="this.dopeSheet.inventoryCode != 'inventory_cost'">
              <div v-if="current === 1">关联单个清单细目</div>
              <div v-if="current === 2 && quanxian != 1"><el-button type="primary" class="el-button-primary" size="mini" @click="changeCurrent(2)">重选清单项目</el-button></div>
              <div v-if="current === 1 && quanxian != 1"><el-checkbox label="是否多选" v-model="linkCheck" @change="linkCheckChange"></el-checkbox></div>
              <div v-if="quanxian == 1" style="z-index: 2;">关联分项清单细目</div>
              <div v-if="quanxian == 1"></div>
            </div>
            <div class="tree" v-if="this.dopeSheet.inventoryCode != 'inventory_cost'">
              <div v-if="current === 1">
                <div class="tree-search" v-if="quanxian !== 1">
                  <el-input size="mini" placeholder="输入关键字进行过滤" v-model="filterText2"> </el-input>
                </div>
                <div class="checkeds2" v-if="!linkCheck">
                  <el-radio-group v-model="radioId" :disabled="quanxian === 1" @change="radioIdChange">
                    <el-radio class="checkboxWidth" :label="item.fkSysItemDetailId" v-for="item in showDetailsList" :key="item.fkSysItemDetailId">{{ item.itemName }}</el-radio>
                  </el-radio-group>
                </div>
                <div class="checkeds2" v-if="linkCheck">
                  <el-checkbox-group v-model="checkList2" :disabled="quanxian === 1" @change="checkChange">
                    <el-checkbox class="checkboxWidth" :label="item.fkSysItemDetailId" v-for="item in showDetailsList" :key="item.fkSysItemDetailId">{{ item.itemName }}</el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>
              <div v-if="current === 2">
                <div class="tree-search" v-if="quanxian !== 1">
                  <!-- <el-input size="mini" placeholder="输入关键字进行过滤" v-model="filterText" :disabled="treeInput"> </el-input> -->
                  <el-checkbox label="只显示可选项" v-model="onlyCheck"></el-checkbox>
                </div>
                <div class="wrap">
                  <!-- <el-tree
                :data="deptOptions"
                node-key="id"
                :props="defaultProps"
                :expand-on-click-node="true"
                :check-strictly="true"
                :filter-node-method="filterNode"
                show-checkbox
                ref="tree"
                @check="handleNodeClick"
              /> -->
                  <elTree2 :data="treeShowList" ref="tree" show-checkbox :check-strictly="true" node-key="pkId" :props="defaultProps" @node-expand="nodeExpand" :default-expand-all="treeCheckAll" @check-change="treeCheckedChange" :filter-node-method="filterNode" v-if="treeshow">
                    <span slot-scope="{ node, data }">
                      <el-tooltip effect="dark" :content="node.label" placement="bottom-start" :disabled="isShowTooltip">
                        <div :class="'label' + data.grade" @mouseenter="onMouseEnter(`label${data.grade + String(node.id)}`)">
                          <span :ref="'label' + data.grade + String(node.id)">{{ node.label }}</span>
                        </div>
                      </el-tooltip>
                    </span>
                  </elTree2>
                </div>
              </div>
            </div>
            <div class="btn" v-if="this.dopeSheet.inventoryCode != 'inventory_cost' && quanxian !== 1 && current === 1">
              <el-button type="primary" class="el-button-primary" size="mini" @click="changeCurrent(1)" :disabled="!radioId && !checkList2.length">下一步</el-button>
            </div>
            <!-- <el-tabs v-model="activeName" type="card" v-if="this.dopeSheet.inventoryCode == 'inventory_cost'">
            <el-tab-pane label="分项工程" name="1">
              <div class="wrap tree">
                <el-tree :data="temporaryList" ref="tree2" show-checkbox :check-strictly="true" node-key="pkId" :props="defaultProps" default-expand-all @check-change="treeCheckedChange2">
                  <span slot-scope="{ node, data }">
                    <el-tooltip effect="dark" :content="node.label" placement="bottom-start" :disabled="isShowTooltip">
                      <div :class="'label' + data.grade" @mouseenter="onMouseEnter(`label${data.grade + String(node.id)}`)">
                        <span :ref="'label' + data.grade + String(node.id)">{{ node.label }}</span>
                      </div>
                    </el-tooltip>
                  </span>
                </el-tree>
              </div>
            </el-tab-pane>
            <el-tab-pane label="费用项目" name="2">
              <div class="tree checkeds">
                <el-checkbox-group v-model="checkList" :disabled="quanxian === 1">
                  <el-checkbox class="checkboxWidth" :label="item.value" v-for="item in costList" :key="item.value">{{ item.label }}</el-checkbox>
                </el-checkbox-group>
              </div>
            </el-tab-pane>
          </el-tabs> -->
          </div>
        </div>
      </div>
      <div class="dialog-form" v-if="dopeSheet.inventoryCode == 'inventory_itemize'">
        <el-form label-width="100px">
          <el-form-item label="清单类型" v-if="[1, 2, 4].includes(id)">
            <el-select v-model="dopeSheet.inventoryCode" @change="detailTypeChange" size="mini" style="width: 100%" :disabled="quanxian !== 2 || !dopeSheet.isUpdate">
              <el-option v-for="item in listType" :key="item.value" :value="item.value" :label="item.label"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="子目号" v-if="[1, 2, 4].includes(id)">
            <el-input v-model="dopeSheet.subitemNum" :disabled="quanxian === 1 || !dopeSheet.isUpdate" size="mini" :maxlength="25" @focus="openChangeItemCodeDialog(dopeSheet, 3)" oninput="this.value = this.value.replace(/[^0-9]/g, '');"></el-input>
          </el-form-item>
          <el-form-item label="清单名称" v-if="[1, 2, 4].includes(id)">
            <el-input v-model="dopeSheet.detailName" :disabled="quanxian === 1 || !dopeSheet.isUpdate" size="mini" :maxlength="25"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose2">取 消</el-button>
        <el-button type="primary" class="el-button-primary" v-if="quanxian != 1" @click="handleOk">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分包合同选择物料 -->
    <el-dialog top="5vw" :close-on-press-escape="false" title="清单信息" :visible="MetralDialog" @close="handleClose3" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form">
        <div class="listDialog">
          <div class="listDialog-left">
            <el-form label-width="100px">
              <el-form-item label="选择物料">
                <el-input size="mini" :value="metralForm.materialName" disabled v-if="quanxian == 1 || (dialogShowType != 2 && quanxian == 3)"></el-input>
                <el-cascader size="mini" style="width: 100%" :options="options" :props="setProps" @change="cascaderChange2" :emitPath="false" v-model="material" filterable ref="cascader2" v-else></el-cascader>
              </el-form-item>
              <el-form-item label="单位">
                <el-input v-model="metralForm.unitName" size="mini" disabled></el-input>
              </el-form-item>
              <el-form-item label="供应方式" v-if="id === 4 && radio1 === 2">
                <el-select v-model="metralForm.inventoryCode" @change="inventoryCodeChange" size="mini" style="width: 100%" :disabled="quanxian === 1">
                  <el-option v-for="item in tabs2List" :key="item.value" :value="item.value" :label="item.label"> </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="超额扣款单价" v-if="metralForm.inventoryCode === 'supply_noDeduction' && pricePermission">
                <el-input v-model="metralForm.excessPrice" :disabled="quanxian === 1" size="mini" oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')" @blur="metralForm.excessPrice = $event.target.value" @input="secondInput" :maxlength="secondMaxLength"></el-input>
              </el-form-item>
              <el-form-item :label="id === 4 && radio1 == 2 && metralForm.inventoryCode === 'supply_noDeduction' ? '限额供应量' : '供应数量'">
                <el-input v-model="metralForm.supplyNum" :disabled="quanxian === 1" size="mini" oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')" @blur="metralForm.supplyNum = $event.target.value" @input="secondInput" :maxlength="secondMaxLength"></el-input>
              </el-form-item>
              <el-form-item :label="id === 4 && radio1 == 2 && metralForm.inventoryCode === 'supply_noDeduction' ? '材料价格' : '供应价格'">
                <el-input v-model="metralForm.supplyPrice" :disabled="quanxian === 1" size="mini" oninput="value=value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')" @blur="metralForm.supplyPrice = $event.target.value" @input="secondInput" :maxlength="secondMaxLength"></el-input>
              </el-form-item>
              <el-form-item label="供应总额" v-if="metralForm.inventoryCode !== 'supply_noDeduction'">
                <el-input :value="amount2" disabled size="mini" type="number"></el-input>
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="metralForm.remark" :disabled="quanxian === 1" resize="none" type="textarea" rows="4" :maxlength="100"></el-input>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose3">取 消</el-button>
        <el-button type="primary" class="el-button-primary" v-if="quanxian != 1" @click="handleOk2">确 定</el-button>
      </span>
    </el-dialog>
    <!-- fkMaterialId -->
    <selectMaterDialog :materDialog.sync="materDialog" @getSelect="getSelect" :customId="addContractDate.fkCustomerId" :contractId="addContractDate.pkId" :isOrder="(id == 3 && materialType == 3) || (id == 4 && tabs2 == 'supply_other') ? 1 : 0" :selectMater="id === 3 ? tableData.map(item => item.fkMaterialId) : [...this.materialTable, ...this.materialTable2, ...this.materialTable3].map(item => item.fkMaterialId)" :selectMaters="selectMaters" />
    <!-- 修改子目号 -->
    <el-dialog :visible.sync="changeItemCodeDialog" title="" width="40%" top="45vh" v-dialogDrag :close-on-click-modal="false" class="amendDialog">
      <!-- <div class="dialog-form"> -->
      <div class="amend-close">
        <i class="closeBtn el-icon-circle-close" @click="changeItemCodeDialog = false"></i>
      </div>
      <div class="itemCode">
        <el-select v-model="changeItemCodeDialogType" size="mini" class="select">
          <el-option v-for="item in changeTypeList" :key="item.value" :label="item.label" :value="item.value"> </el-option>
        </el-select>
        <div class="itemCode-content wh-60per">
          <el-input size="mini" class="wh-60" v-if="changeItemCodeDialogType > 0" @keyup.enter.native="changeInputEnter(1)" v-model="itemCodes[0]" ref="changeInput" maxlength="20" oninput="this.value = this.value.replace(/[^0-9]/g, '');" @blur="itemCodes[0] = $event.target.value"></el-input>
          <div class="str" v-if="changeItemCodeDialogType > 1">-</div>
          <el-input size="mini" class="wh-60" v-if="changeItemCodeDialogType > 1" @keyup.enter.native="changeInputEnter(2)" v-model="itemCodes[1]" ref="changeInput2" maxlength="20" oninput="this.value = this.value.replace(/[^0-9]/g, '');" @blur="itemCodes[1] = $event.target.value"></el-input>
          <div class="str" v-if="changeItemCodeDialogType > 2">-</div>
          <el-input size="mini" class="wh-60" v-if="changeItemCodeDialogType > 2" @keyup.enter.native="changeInputEnter(3)" v-model="itemCodes[2]" ref="changeInput3" maxlength="20" oninput="this.value = this.value.replace(/[^0-9]/g, '');" @blur="itemCodes[2] = $event.target.value"></el-input>
          <div class="str" v-if="changeItemCodeDialogType > 3">-</div>
          <el-input size="mini" class="wh-60" v-if="changeItemCodeDialogType > 3" @keyup.enter.native="changeInputEnter(4)" v-model="itemCodes[3]" ref="changeInput4" maxlength="20" oninput="this.value = this.value.replace(/[^0-9]/g, '');" @blur="itemCodes[3] = $event.target.value"></el-input>
          <div class="str" v-if="changeItemCodeDialogType === 5">-</div>
          <el-input size="mini" class="wh-60" v-if="changeItemCodeDialogType === 5" @keyup.enter.native="changeItemCode" v-model="itemCodes[4]" ref="changeInput5" maxlength="20" oninput="this.value = this.value.replace(/[^0-9]/g, '');" @blur="itemCodes[4] = $event.target.value"></el-input>
        </div>
        <el-button size="mini" type="primary" class="changeItemCode el-button-primary" @click="changeItemCode">确定</el-button>
      </div>
      <!-- </div> -->
    </el-dialog>
    <!-- 查看图片，work，excel文档使用的弹框 -->
    <el-dialog :close-on-press-escape="false" title="" :visible.sync="previewDialog" class="preview">
      <div class="previewHeight dialog-form" ref="previewHeight">
        <iframe ref="iframe" class="iframe" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + nowPreviewObj" v-if="previewType == 1"></iframe>
        <img class="img" :src="nowPreviewObj" alt="" v-if="previewType == 3" />
      </div>
    </el-dialog>
    <!-- 查看pdf弹框-->
    <pdfPiev ref="pdfPiev" :urlr="url" />
    <!-- 章节信息 -->
    <el-dialog top="5vw" :close-on-press-escape="false" :title="chapterTitle" width="500px" :visible="chapterShow" @close="handleClose4" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="dialog-form">
        <div class="listDialog">
          <div class="listDialog-left">
            <el-form label-width="100px">
              <!-- <el-form-item label="章节编号">
                <el-input v-model="chapterData.code" size="mini" type="number">
                  <template slot="append">章</template>
                </el-input>
              </el-form-item> -->
              <el-form-item label="章节名称">
                <el-input v-model.trim="chapterData.name" :maxlength="20" size="mini"></el-input>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose4">取 消</el-button>
        <el-button type="primary" class="el-button-primary" @click="handleOk4">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import COS from "cos-js-sdk-v5";
import Sortable from "sortablejs"; //插件引入
import moment from "moment";
import elTree2 from "../../../utils/tree/src/tree.vue";
import selectMaterDialog from "./selectMaterDialog.vue";
import pdfPiev from "../../../components/pdf-preview/pdf-preview.vue";
import utils from "@/utils/util";
import printJs from "print-js";
export default {
  components: { elTree2, selectMaterDialog, pdfPiev },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    typeStatus: {
      type: Boolean,
      default: false
    },
    // 1为查看，2为新增和编辑
    dialogShowType: {
      type: Number
    },
    id: {
      type: Number
    }
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    },
    pricePermission() {
      let arr = this.$store.state.menuData.filter(item => item.menuCode == "contract");
      if (![0].includes(this.user.orgType)) {
        if (this.dialogShowType !== 1) {
          return true;
        } else {
          console.log(arr);
          return arr.length ? !!arr[0].states : false;
        }
      } else {
        return true;
      }
    },
    contracter() {
      if (this.id === 2 && this.user.orgType === 3) return "标段项目";
      if (this.id === 3 && this.user.orgType === 6) return "甲方单位";
      if (this.id === 4 && this.user.orgType === 7) return "项 目 部";
      if (this.id === 1) return "建设单位";
      if (this.id === 2) return "监理公司";
      if (this.id === 3) return "供应商";
      if (this.id === 4) return "分包单位";
    },
    cusType() {
      if (this.id === 2 && this.user.orgType === 3) return 0;
      if (this.id === 1) return 0;
      if (this.id === 2) return 1;
      if (this.id === 3) return 3;
      if (this.id === 4) return 4;
    },
    showDetailsList() {
      return this.detailsList.filter(item => item.itemName.indexOf(this.filterText2) !== -1);
    },
    contentAmount() {
      let count = 0;
      if ([1, 2, 4].includes(this.id)) {
        this.tableData.forEach(item => {
          if (item.amount != undefined && item.amount != null && item.amount != "") {
            count += item.amount - 0;
          }
        });
        if (this.tabsList != null && this.tabsList.length) {
          this.tabsList.forEach(item => {
            item.details.forEach(item2 => {
              if (item2.amount != undefined && item2.amount != null && item2.amount != "") {
                count += item2.amount - 0;
              }
            });
          });
        }
      }
      if (this.id === 3) {
        this.tableData.forEach(item => {
          if (item.fkMaterialId) {
            if (item.amount != undefined && item.amount != null && item.amount != "") {
              count += item.amount - 0;
            }
          }
        });
      }
      // if (this.id === 4) {
      //   this.tableData.forEach(item => {
      //     count += item.amount - 0;
      //   });
      //   // this.materialTable2.forEach(item => {
      //   //   if(item.fkMaterialId){
      //   //     let amount = (item.supplyPrice - 0) * (item.supplyNum - 0) ? ((item.supplyPrice - 0) * (item.supplyNum - 0)).toFixed(2) - 0 : "";
      //   //     count -= amount - 0;
      //   //   }
      //   // });
      // }
      count = count.toFixed(2) - 0;
      this.addContractDate.amount = count;
      return count;
    },
    amount() {
      // this.dopeSheet.amount = (this.dopeSheet.price * this.dopeSheet.contractNum).toFixed(2) - 0;
      // return this.dopeSheet.amount;
      if (this.dopeSheet.inventoryCode !== "inventory_cost") {
        this.dopeSheet.amount = (this.dopeSheet.price * this.dopeSheet.contractNum).toFixed(2) - 0;
        return this.dopeSheet.amount;
      } else {
        return this.dopeSheet.amount;
      }
    },
    amount3() {
      this.dopeSheet.amount = (this.dopeSheet.price * this.dopeSheet.quantities).toFixed(2) - 0;
      return this.dopeSheet.amount;
    },
    amount2() {
      const sum = (this.metralForm.supplyPrice * this.metralForm.supplyNum).toFixed(2) - 0;
      return sum;
    },
    treeShowList() {
      if (this.quanxian === 1) {
        return this.deptOptions;
      }
      if (!this.major) {
        return this.deptOptions;
      } else {
        return this.deptOptions.filter(item => item.fkProfessionalTypeId === this.major);
      }
    },
    // tabsList() {
    //   // pkId engTypeName
    //   // this.majorTypeList;
    //   const arr = [];
    //   let setArr = [];
    //   const arr2 = [];

    //   this.tableData.forEach(item => {
    //     if (item.inventoryCode == "inventory_build") {
    //       arr.push(item.fkProfessionalTypeId);
    //     } else if (item.inventoryCode == "inventory_cost") {
    //       arr.push(item.inventoryCode);
    //     }
    //   });
    //   setArr = [...new Set(arr)];

    //   this.majorTypeList2.forEach(item => {
    //     if (setArr.includes(item.pkId)) {
    //       arr2.push({ ...item });
    //     }
    //   });
    //   if (setArr.includes("inventory_cost")) {
    //     arr2.push({ pkId: "inventory_cost", engTypeName: "费用类" });
    //   }
    //   // console.log(arr, arr2, setArr);
    //   return arr2;
    // },
    // 分包合同的清单项目展示表
    subConProShowList() {
      return this.tableData.filter(item => {
        if (this.tabs == "inventory_cost") {
          return item.inventoryCode === "inventory_cost";
        } else {
          return item.inventoryCode === "inventory_build" && item.fkProfessionalTypeId === this.tabs;
        }
      });
    },
    // 分包合同的供应材料展示表
    materialShowList() {
      if (this.tabs2 == "supply_noDeduction") {
        return this.materialTable;
      } else if (this.tabs2 == "supply_deduction") {
        return this.materialTable2;
      } else if (this.tabs2 == "supply_other") {
        return this.materialTable3;
      }
    },
    // 供货合同展示表
    materialList() {
      return this.tableData.filter(item => item.inventoryType == this.materialType);
    },
    selectMaters() {
      if (this.id == 3) {
        // console.log("789102225588877888888888888888888")
        // console.log(this.materialList)
        // console.log("789102225588877888888888888888888")
        if (this.materialType == "3") {
          return this.materialList.map(item => {
            if (item.fkMaterialId && item.fkMaterialId != "0") {
              return item.fkMaterialId;
            } else {
              return item.fkMaterialTypeId;
            }
          });
        } else {
          return this.tableData.map(item => {
            if (item.fkMaterialId && item.fkMaterialId != "0") {
              return item.fkMaterialId;
            } else {
              return item.fkMaterialTypeId;
            }
          });
        }

        // this.tableData
      } else {
        let arr = [...this.materialTable, ...this.materialTable2, ...this.materialTable3];
        return arr.map(item => {
          if (item.fkMaterialId && item.fkMaterialId != "0") {
            return item.fkMaterialId;
          } else {
            return item.fkMaterialTypeId;
          }
        });
      }
    }
  },
  data() {
    return {
      tableData: [], // 清单列表
      materialTable: [{ myId: 1, inventoryCode: "supply_noDeduction", isRemove: 0 }],
      materialTable2: [{ myId: 1, inventoryCode: "supply_deduction", isRemove: 0 }],
      materialTable3: [{ myId: 1, inventoryCode: "supply_deduction", isRemove: 0 }],
      listInfoDialog: false,
      addContractDate: {
        amount: "",
        signDate: "",
        beginDate: "",
        endDate: "",
        contractName: "",
        fkOrgId: null,
        amount: null,
        contractType: this.id,
        endDate: "",
        fkCustomerId: "",
        fkOrgId: "",
        fkProjectId: "",
        taxRate: ""
      },
      constructionUnits: [],
      // 清单信息
      dopeSheet: {
        detailName: null, // 工程名称
        quantities: "", // 合同数量
        contractNum: "",
        fkUnitId: null, // 单位
        fkMaterialId: "",
        price: null, // 清单价
        amount: null, // 清单总额
        remark: null, // 备注
        itemIds: [] // 分项工程
      },
      unitData: [],
      deptOptions: [],
      defaultProps: {
        value: "pkId",
        label: "itemName",
        children: "prodItemLists",
        checkStrictly: true,
        disabled: this.treeDisable
      },
      contractItem: [],
      amendIndex: null, // 修改清单信息的索引
      rowDates: {},
      attachments: [],
      quanxian: 1,
      loading: false,
      randeKeys: Math.random(),
      projectId: "",
      setInfo: [],
      moneyMaxLeng: 15, // 规定最大可输入的长度
      moneyMaxLeng2: 15,
      options: [],
      setProps: {
        value: "pkId",
        label: "typeName",
        children: "childList",
        disabled: "isChoose"
      },
      filterArr: [],
      material: "",
      openDetail: {},
      filterText: "",
      filterText2: "",
      linkCheck: false,
      majorTypeList: [],
      majorTypeList2: [],
      major: "",
      onlyCheck: false,
      isShowTooltip: true,
      treeInput: false,
      treeCheckAll: false,
      treeshow: true,
      radio1: 1,
      tabs: "",
      tabs2: "supply_noDeduction",
      tabsList: [],
      tabs2List: [],
      listType: [],
      MetralDialog: false,
      metralForm: {
        materialName: "", // 物料名称
        excessPrice: "", // 超额扣款单价
        fkMaterialId: "", // 供货物料ID
        inventoryCode: "", // 供应方式编码
        remark: "", // 备注
        supplyNum: "", // 供应数量/限额供应量
        supplyPrice: "", // 供应单价
        materialTypeName: "",
        unitName: ""
      },
      secondMaxLength: 12,
      costList: [],
      checkList: [],
      materDialog: false,
      nowAddMaterObj: {},
      temporaryList: [],
      activeName: "1",
      current: 1,
      checkList2: [],
      radioId: "",
      detailsList: [],
      itemCodes: [],
      nowClick: {},
      changeItemCodeDialog: false,
      changeItemCodeDialogType: 1,
      changeTypeList: [
        { value: 1, label: "一级子目号" },
        { value: 2, label: "二级子目号" },
        { value: 3, label: "三级子目号" },
        { value: 4, label: "四级子目号" },
        { value: 5, label: "五级子目号" }
      ],
      newAddList: [],
      delList: [],
      unitSea: "",
      isMater: false,
      lasetMaterCodeType: "",
      lasetCheckCodeType: "",
      itemCodeType: "",
      rowContractId: "",
      // 当前预览的表单obj
      nowPreviewObj: {},
      // 预览弹框的状态
      previewDialog: false,
      // 查看附件的状态：1为work和excel，2为pdf，3为图片
      previewType: 0,
      url: "",
      times: 0,
      chapterShow: false,
      chapterTitle: "",
      chapterData: {
        name: ""
      },
      currentIndex: 0,
      materialType: "2",
      detailMaterialList: [], //供货合同清单材料
      orderMaterialList: [], //供货合同其他材料
      tabIdx: 0,
      redList: [],
      rowKeys: false,
      allowModifyStatus: false,
      contractNumber: "",
      unitData2: [],
      tagsObject: {}
    };
  },
  mounted() {
    console.log(this.pricePermission);
    console.log(this.dialogShowType);
  },
  methods: {
    //拖拽方法
    rowDrop() {
      const el = document.querySelector(".tabSign .el-tabs__nav"); //找到想要拖拽的那一列
      console.log(el);
      const _this = this;
      this.tagsObject = Sortable.create(el, {
        onEnd({ newIndex, oldIndex }) {
          //oldIIndex拖放前的位置， newIndex拖放后的位置  //tabOptionList为遍历的tab签
          const currRow = _this.tabsList.splice(oldIndex, 1)[0]; //鼠标拖拽当前的el-tabs-pane
          _this.tabsList.splice(newIndex, 0, currRow); //tableData 是存放所以el-tabs-pane的数组
        }
      });
    },
    showInpKey(value) {
      // const reg = /^[^!@#$%^&*()-=+]/g; // 匹配非数字、字母、汉字
      // if (reg.test(value)) {
      value = value.replace(/\s+/g, "");
      // }
      this.addContractDate.contractName = value;
      console.log(this.addContractDate.contractName);
    },
    handleCommand(command) {
      console.log(typeof command);
      if (typeof command == "string") {
        if (command == "del") {
          this.removeTab(this.tabs);
        } else {
          this.handleOpen(2);
        }
      } else {
        this.dblclick(command);
      }
    },
    dblclick(index) {
      this.tabIdx = index;
      // this.chapterData.name = item.chapterName;
      this.chapterData.name = this.tabs;
      this.chapterTitle = "编辑章节";
      this.chapterShow = true;
    },
    getMaxId(list) {
      let arr = list.map(item => item.myId);
      console.log(arr, Math.max.apply(Math, arr));
      return Math.max.apply(Math, arr);
    },
    materPriceInput(row) {
      (row.contractNum - 0) * (row.price - 0) ? (row.amount = ((row.contractNum - 0) * (row.price - 0)).toFixed(2) - 0) : (row.amount = 0);
    },
    chapterOpen(type, item, index) {
      // chapterOpen
      if (type == 1) {
        this.chapterTitle = "查看";
        this.chapterShow = true;
      } else if (type == 3) {
        this.chapterTitle = "编辑";
        this.chapterShow = true;
      } else {
        this.tabsList[this.currentIndex].details = this.tabsList[this.currentIndex].details.filter(items => items.detailName !== item.detailName);
      }
    },
    removeTab(targetName) {
      let self = this;
      let tab = JSON.stringify(this.tabsList);
      tab = JSON.parse(tab);
      let activeName = this.tabs;
      if (activeName === targetName) {
        tab.forEach((item, index) => {
          if (item.chapterName === targetName) {
            let nextTab = tab[index + 1] || tab[index - 1];
            if (nextTab) {
              activeName = nextTab.chapterName;
            }
          }
        });
      }

      this.tabs = activeName;
      self.tabsList = tab.filter(tab => tab.chapterName !== targetName);
    },
    beforeLeave(currentName, oldName) {
      if (currentName == "add") {
        this.addChapter();
        return false;
      } else {
        console.log(currentName);
        console.log(oldName);
        this.tabsList.forEach((item, idx) => {
          if (item.chapterName == currentName) {
            this.currentIndex = idx;
          }
        });
      }
    },
    handleClose4() {
      this.chapterShow = false;
    },
    handleOk4() {
      if (!this.chapterData.name) {
        return this.$message.warning("请输入章节名称");
      }
      let states = false;
      if (this.tabsList.length != 0) {
        this.tabsList.forEach((item, idx) => {
          if ((this.chapterTitle == "新增章节" || (this.chapterTitle == "编辑章节" && this.tabIdx != idx)) && item.chapterName == this.chapterData.name) {
            states = true;
          }
        });
      } else {
        this.tabs = this.chapterData.name;
      }
      if (states) {
        return this.$message.warning("章节名称不能重复");
      }
      if (this.chapterTitle == "编辑章节") {
        this.tabsList[this.tabIdx].chapterName = this.chapterData.name;
        this.tabs = this.chapterData.name;
      } else {
        this.tabsList.push({
          chapterName: this.chapterData.name,
          details: []
        });
      }
      console.log(this.tabsList);
      this.handleClose4();
    },
    addChapter() {
      this.chapterData.name = "";
      this.chapterTitle = "新增章节";
      this.chapterShow = true;
    },
    radioIdChange() {
      console.log(this.radioId);
      this.dopeSheet.itemIds = [];
      this.dopeSheet.quantities = 0;
    },
    checkChange() {
      let arr = [];
      let arr2 = this.dopeSheet.itemIds;
      let num = 0;
      this.deptOptions.forEach(item => {
        item.prodItemLists.forEach(item2 => {
          item2.prodItemLists.forEach(item3 => {
            item3.prodItemLists.forEach(item4 => {
              if (this.checkList2.includes(item4.fkSysItemDetailId) && arr2.includes(item4.pkId)) {
                arr.push(item4.pkId);
                num += Number(item4.designQuantities);
              }
            });
          });
        });
      });
      this.dopeSheet.itemIds = arr;
      this.dopeSheet.quantities = num;
    },

    // 预览
    preview(url) {
      const str = url.substring(url.lastIndexOf(".") + 1);
      if (str == "xlsx" || str == "docx") {
        this.previewType = 1;
        this.nowPreviewObj = url;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      } else if (str == "pdf") {
        this.url = url;
        this.$refs.pdfPiev.pdfShow = true;
      } else {
        this.previewType = 3;
        this.nowPreviewObj = url;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      }
    },
    // 单位搜索
    unitSearch(queryString, cb) {
      let arr = this.unitData;
      let res = queryString ? arr.filter(this.createFilter(queryString)) : arr;
      cb(res);
    },
    unitSearchs(queryString, cb) {
      let arr = this.unitData2;
      let res = queryString ? arr.filter(this.createFilter(queryString)) : arr;
      cb(res);
    },
    unitBlur() {
      if (this.dopeSheet.fkUnitId) {
        this.unitData.forEach(item => {
          if (this.dopeSheet.fkUnitId == item.pkId) {
            this.unitSea = item.unitName;
          }
        });
      } else {
        this.unitSea = "";
      }
    },
    createFilter(queryString) {
      return restaurant => {
        return restaurant.unitName.toLowerCase().indexOf(queryString.toLowerCase()) !== -1;
      };
    },
    unitSelect(val) {
      this.dopeSheet.fkUnitId = val.pkId;
      this.unitSea = val.unitName;
    },
    // 物料选择事件
    cascaderChange(e) {
      // console.log(this.$refs.cascader.getCheckedNodes()[0].pathLabels);
      this.dopeSheet.fkMaterialId = e[e.length - 1];
      this.$nextTick(() => {
        this.dopeSheet.detailName = this.$refs.cascader.getCheckedNodes()[this.$refs.cascader.getCheckedNodes().length - 1].data.typeName;
      });
    },
    cascaderChange2(e) {
      // console.log(this.$refs.cascader.getCheckedNodes()[0].pathLabels);
      this.metralForm.fkMaterialId = e[e.length - 1];
      this.$nextTick(() => {
        const obj = this.$refs.cascader2.getCheckedNodes()[this.$refs.cascader2.getCheckedNodes().length - 1].data;
        this.metralForm.materialName = obj.typeName;
        this.metralForm.materialTypeName = obj.materialTypeName;
        this.metralForm.unitName = obj.unitName;
        console.log(obj, this.metralForm);
      });
    },
    tabsChange() {
      this.randeKeys = Math.random();
    },
    inventoryCodeChange() {
      this.metralForm.excessPrice = "";
      this.metralForm.supplyNum = "";
      this.metralForm.supplyPrice = "";
      this.metralForm.remark = "";
    },
    // 获取物料集
    listAllAndMaterial(customerId) {
      this.$api.listAllAndMaterial({ customerId }).then(res => {
        if (res.code === 200) {
          this.options = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    getItemClass(dictType) {
      this.$store.dispatch("getDictionariesData", dictType).then(res => {
        const data = res.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
        if (dictType === 11) {
          this.tabs2List = data;
        } else if (dictType === 10) {
          this.listType = data;
        } else if (dictType === 15) {
          this.costList = data;
        }
      });
      // this.$api.getItemClass({ dictType }).then(res => {
      //   if (res.code === 200) {
      //     if (dictType === 11) {
      //       this.tabs2List = res.data.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
      //     } else if (dictType === 10) {
      //       this.listType = res.data.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
      //     } else if (dictType === 15) {
      //       this.costList = res.data.map(item => ({ ...item, value: item.keyName, label: item.keyVal }));
      //     }
      //   } else {
      //     this.$message.warning(res.msg);
      //   }
      // });
    },
    // 下载
    download(item) {
      item.suffix = item.suffix.substr(1);
      if (item.suffix == "pdf") {
        this.fileLinkToStreamDownload(item.attachUrl, item.attachName, item.suffix);
      } else {
        window.open(item.attachUrl);
      }
    },
    fileLinkToStreamDownload(url, fileName, type) {
      const reg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+).)+([A-Za-z0-9-~\/])+$/;
      if (!reg.test(url)) {
        throw new Error("传入参数不合法,不是标准的文件链接");
      } else {
        const xhr = new XMLHttpRequest();
        xhr.open("get", url, true);
        xhr.setRequestHeader("Content-Type", `application/${type}`);
        xhr.responseType = "blob";
        xhr.onload = function() {
          if (this.status == 200) {
            // 接受二进制文件流
            // console.log(this);
            const blob = this.response;
            const blobUrl = window.URL.createObjectURL(blob);
            // 这里的文件名根据实际情况从响应头或者url里获取
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(blobUrl);
          }
        };
        xhr.send();
      }
    },
    inpUpload() {
      const pickerOpts = {
        types: [
          {
            description: "pdf",
            accept: {
              "pdf/*": [".pdf"]
            }
          }
        ],
        excludeAcceptAllOption: true,
        multiple: false
      };
      getFile();
      // 创建用于存放文件句柄的变量。
      let fileHandle;
      let then = this;
      async function getFile() {
        // 打开文件选择器，解构返回的数组中的第一个元素
        [fileHandle] = await window.showOpenFilePicker(pickerOpts);
        console.log(fileHandle);
        then.upLoad(fileHandle);
        // 操作 fileHandle 的后续代码
      }
    },
    // 上传
    upLoad() {
      const fileObj = document.getElementById("upload").files[0];
      console.log(fileObj);
      if (!fileObj) {
        return this.$message({
          type: "warning",
          message: "请选择上传的文件"
        });
      }
      if (fileObj.size <= 0) {
        this.$refs.file.value = "";
        return this.$message.warning("文件大小不能为0kb");
      }
      if (fileObj.type != "application/pdf") {
        this.$refs.file.value = "";
        return this.$message.warning("只能上传PDF文件");
      }
      console.log("----============================");
      console.log(fileObj.name);
      console.log("----============================");
      if (fileObj.name.length > 50) {
        this.$refs.file.value = "";
        return this.$message.warning("文件名称长度不能为大于50");
      }
      const f = document.getElementById("upload").files;
      const typeName = f[0].name.substr(f[0].name.lastIndexOf(".")).toLowerCase();
      // return console.log(suffixname)
      const blobFile = this.$options.methods.dataURLtoBlob.bind(this)(fileObj);
      const filename = fileObj.name;
      if (this.attachments.filter(item => item.attachName == filename).length) {
        return this.$message.warning("已有相同名字附件");
      }
      // if()
      let sign = "";
      let path = "";
      this.loading = true;
      this.$api
        .getUploadFileToken()
        .then(res => {
          if (res.code == 200) {
            sign = res.data.token;
            path = res.data.endpoint;
            this.uploadDate = res.data;
            this.$options.methods.upLoads.bind(this)(sign, path, blobFile, filename, res.data.tmpSecretKey, res.data.tmpSecretId, res.data.startTime, res.data.expiredTime, typeName);
            // this.$message.success(res.msg);
          } else {
            this.loading = false;
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 获取签名
    upLoads(sign, folder, file, filename, tmpSecretKey, tmpSecretId, startTime, expiredTime, typeName) {
      const bucket = "epms-1307524156";
      const appid = "1256287502";
      const region = "ap-guangzhou";
      const cos = new COS({
        // 必选参数
        getAuthorization: function(options, callback) {
          callback({
            TmpSecretId: tmpSecretId,
            TmpSecretKey: tmpSecretKey,
            XCosSecurityToken: sign,
            // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
            StartTime: startTime, // 时间戳，单位秒，如：1580000000
            ExpiredTime: expiredTime, // 时间戳，单位秒，如：1580000900
            ScopeLimit: true
          });
        },
        // 可选参数
        FileParallelLimit: 3000, // 控制文件上传并发数
        ChunkParallelLimit: 3000, // 控制单个文件下分片上传并发数
        ProgressInterval: 1000 // 控制上传的 onProgress 回调的间隔
      });

      const _this = this;
      cos.uploadFile(
        {
          Bucket: bucket,
          Region: region,
          Key: _this.uploadDate.objectKey + typeName,
          Body: file,
          onProgress: function(progressData) {
            // console.log(JSON.stringify(progressData));
          }
        },
        function(err, data) {
          if (data.statusCode == 200) {
            const path = "https://" + data.Location;
            _this.newAddList.push(path);
            _this.attachments.push({
              attachName: filename,
              attachUrl: path,
              suffix: typeName
            });
            const obj = document.getElementById("upload");
            // obj.outerHTML = obj.outerHTML;
            obj.value = "";
            _this.loading = false;
            _this.$message.success("上传成功");
          } else {
            _this.loading = false;
            _this.$message.error("上传失败");
          }
        }
      );
    },
    // DataURL转Blob
    dataURLtoBlob(fileObj) {
      return new Blob([fileObj], { type: fileObj.type });
    },

    // submit 保存
    submit() {
      let materials = [];
      let details = [];
      if (this.id === 4) {
        materials = [...this.materialTable.filter(item => item.fkMaterialId || item.fkMaterialTypeId), ...this.materialTable2.filter(item => item.fkMaterialId || item.fkMaterialTypeId), ...this.materialTable3.filter(item => item.fkMaterialId || item.fkMaterialTypeId)];
        let materials2 = [...this.materialTable2.filter(item => item.fkMaterialId), ...this.materialTable3.filter(item => item.fkMaterialId)];
        let arr = materials2.filter(item => !item.supplyPrice || !item.supplyNum);
        let arr1 = [];
        arr.forEach(item => {
          if (item.fkMaterialId != undefined && item.fkMaterialId == null && item.fkMaterialId == 0) {
            arr1.push(item);
          }
        });
        this.redList = arr1.map(item => item.fkMaterialId);
        if (this.redList.length) {
          this.radio1 = 2;
          this.tabs2 = arr1[0].inventoryCode;
          return this.$message.warning("数据缺少，请填写完整后再提交");
        }
        materials = this.sortList(materials);
        // return console.log(materials);
        materials.forEach(item => {
          if (item.fkMaterialId == null || item.fkMaterialId.length == 0) {
            delete item.fkMaterialId;
          }
        });
      }
      if (this.id === 3) {
        details = this.tableData.filter(item => item.fkMaterialTypeId);
        // let detailsrt = this.tableData.filter(item => item.fkMaterialId);
        let detailsrt = [];
        this.tableData.forEach(item => {
          if (item.fkMaterialId != undefined && item.fkMaterialId != "" && item.fkMaterialId != 0) {
            detailsrt.push(item);
          }
        });
        let arr = detailsrt.filter(item => !item.amount);
        this.redList = arr.map(item => item.fkMaterialId);
        if (this.redList.length) {
          this.materialType = arr[0].inventoryType;
          return this.$message.warning("数据缺少，请填写完整后再提交");
        }
      } else {
        details = this.tableData;
      }

      // return console.log(  this.tableData)
      let data = {
        amount: this.addContractDate.amount,
        beginDate: moment(this.addContractDate.beginDate).format("YYYY-MM-DD"),
        contractName: this.addContractDate.contractName,
        contractType: this.id,
        endDate: moment(this.addContractDate.endDate).format("YYYY-MM-DD"),
        signDate: moment(this.addContractDate.signDate).format("YYYY-MM-DD"),
        fkOrgId: this.user.fkOrgId,
        fkCustomerId: this.addContractDate.fkCustomerId,
        // details:[]
        details,
        materials,
        taxRate: this.addContractDate.taxRate,
        // tableData
        attachments: this.attachments,
        contractChapters: this.tabsList,
        contractNumber: this.contractNumber
      };
      if (this.addContractDate.taxRate != null && this.addContractDate.taxRate.length != 0 && this.addContractDate.taxRate - 0 > 100) {
        return this.$message.warning("结算税点不能大于100%");
      }
      if (this.user.orgType === 3) {
        data = { ...data, fkProjectId: this.addContractDate.fkProjectId };
      }
      console.log(this.addContractDate.contractName);
      if (this.addContractDate.contractName == "") {
        return this.$message.warning("请输入合同名称");
      }
      if (this.addContractDate.contractName.length < 2) {
        return this.$message.warning("合同名称长度最少为2");
      }
      // if (!this.addContractDate.amount) {
      //   return this.$message.warning("请输入合同金额");
      // }
      if (this.addContractDate.amount < 0) {
        return this.$message.warning("合同金额不能小于0");
      }
      // if (this.addContractDate.amount < 0) {
      //   return this.$message.warning("请输入正确的合同金额");
      // }
      if (!this.addContractDate.fkCustomerId) {
        return this.$message.warning(`请选择${this.contracter}`);
      }
      if (!this.addContractDate.signDate) {
        return this.$message.warning("请输入合同签订时间");
      }
      if (!this.addContractDate.beginDate && this.id != 3) {
        return this.$message.warning("请输入施工开始日期");
      }
      if (!this.addContractDate.endDate && this.id != 3) {
        return this.$message.warning("请输入施工完成日期");
      }
      // if (!this.tableData.length) {
      //   return this.$message.warning("请添加合同清单");
      // }
      // if (this.id === 3 && !this.tableData.filter(item => item.fkMaterialId).length) {
      //   return this.$message.warning("请添加合同清单");
      // }
      if (this.addContractDate.beginDate > this.addContractDate.endDate && this.id != 3) {
        return this.$message.warning("施工开始日期不能大于施工结束日期");
      }
      if (data.details.filter(item => !item.subitemNum).length) {
        return this.$message.warning("有合同清单未填写子目号");
      }
      if (this.id != 3) {
        for (let i = 0; i < data.contractChapters.length; i++) {
          const arr = data.contractChapters[i];
          if (!arr.details.length) {
            return this.$message.warning(arr.chapterName + "的清单列表不能为空");
          }
        }
      }
      if (data.materials.filter(item => !item.subitemNum).length) {
        return this.$message.warning("有物料未填写子目号");
      }
      if (this.id == 3) {
        delete data.endDate;
        delete data.beginDate;
      }
      this.loading = true;
      if (this.dialogShowType == 2) {
        this.$api
          .addContract(data)
          .then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "新增成功"
              });
              this.handleClose(true);
              this.$emit("refresh", false);
            } else {
              this.$message.warning(res.msg);
            }
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
          });
      } else {
        data.pkId = this.rowDates.pkId;
        data.attachmentIds = this.rowDates.attachmentIds;
        if (this.id == 3) {
          delete data.contractChapters;
        }
        this.$api
          .editContractById(data)
          .then(res => {
            if (res.code == 200) {
              this.$message({
                type: "success",
                message: "编辑成功"
              });
              this.handleClose(true);
              this.$emit("refresh", false);
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

    treeCheckedChange(data, isChecked) {
      if (isChecked) {
        // const checked = [data.id]; // id为tree的node-key属性
        // this.$refs.tree.setCheckedKeys(checked);
        if (!this.dopeSheet.itemIds.includes(data.pkId)) {
          this.dopeSheet.itemIds.push(data.pkId);
          this.dopeSheet.quantities = (this.dopeSheet.quantities - 0 + Number(data.designQuantities)).toFixed(6) - 0;
        }
        // this.filterText = data.itemName;
        // this.treeInput = true;
      } else {
        this.dopeSheet.itemIds = this.dopeSheet.itemIds.filter(item => item !== data.pkId);
        this.dopeSheet.quantities = (this.dopeSheet.quantities - data.designQuantities).toFixed(6) - 0;
        // if (!this.$refs.tree.getCheckedKeys().length) {
        //   this.filterText = "";
        //   this.treeInput = false;
        // }
      }
    },
    treeCheckedChange2(data, isChecked) {
      if (isChecked) {
        if (!this.dopeSheet.itemIds.includes(data.pkId)) {
          this.dopeSheet.itemIds.push(data.pkId);
          this.dopeSheet.amount = this.dopeSheet.amount - 0 + Number(data.designQuantities);
        }
      } else {
        this.dopeSheet.itemIds = this.dopeSheet.itemIds.filter(item => item !== data.pkId);
        this.dopeSheet.amount -= data.designQuantities;
      }
    },
    // handleNodeClick() {},
    // 获取所有施工单位
    projCustomSearch() {
      this.$api.projCustomSearch({ customType: this.cusType }).then(res => {
        if (res.code == 200) {
          this.constructionUnits = res.data;
          if (this.cusType === 0 && this.dialogShowType === 2) {
            this.addContractDate.fkCustomerId = res.data.length ? res.data[0].pkId : "";
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 查询所有单位
    conditionUnits() {
      this.$api.conditionUnits({ unitType: 0 }).then(res => {
        if (res.code == 200) {
          this.unitData = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
      this.$api.conditionUnits({ unitType: 2 }).then(res => {
        if (res.code == 200) {
          this.unitData2 = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 专业类别更改
    majorChange() {
      this.radioId = "";
      this.checkList2 = [];
      this.current = 1;
      this.searchItemDetailByOrgId();
    },
    // 获取专业类别
    searchMajorTypeList(type, item) {
      let data = { typeId: this.user.fkEnginerringTypeId, customId: this.addContractDate.fkCustomerId, projectBidId: this.addContractDate.fkProjectId, contractId: this.rowContractId };
      this.$api.searchMajorTypeListByContent(data).then(res => {
        if (res.code == 200) {
          this.majorTypeList = res.data;
          if (res.data && this.quanxian === 2 && res.data.length) {
            this.major = res.data[0].pkId;
            this.dopeSheet.fkProfessionalTypeId = res.data[0].pkId;
          }
          this.searchItemDetailByOrgId();
          if (this.id !== 3 && this.quanxian != 2) {
            if (type === 1) {
              if (item.inventoryCode == "inventory_build") {
                this.allCategory(item.pkId);
              }
            } else {
              this.allCategory();
            }
          }
          // if (this.id === 4) {
          //   if (res.data) {
          //     this.major = res.data[0].pkId;
          //     this.dopeSheet.fkProfessionalTypeId = res.data[0].pkId;
          //   }
          // }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    searchMajorTypeList2(typeId, type) {
      let typeIds = this.user.orgType === 5 ? typeId : "";
      this.$api.searchMajorTypeList({ typeId: typeIds }).then(res => {
        if (res.code == 200) {
          this.majorTypeList2 = res.data;
          if (type === 2) {
            if ([1, 2, 4].includes(this.id)) {
              this.tabs = this.tabsList.length ? this.tabsList[0].pkId : "";
            }
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    searchItemDetailByOrgId() {
      this.loading = true;
      let projectId = this.user.orgType === 5 ? "" : this.addContractDate.fkProjectId;
      let data = { projectId, fkProfessionalTypeId: this.major, customId: this.addContractDate.fkCustomerId, contractId: this.rowContractId };
      this.$api
        .searchItemDetailByOrgId(data)
        .then(res => {
          this.loading = false;
          if (res.code === 200) {
            this.detailsList = res.data;
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 获取所有工程细目类别
    allCategory(detailId = "", isTrue) {
      this.loading = true;
      const data = {
        detailId,
        projectId: this.addContractDate.fkProjectId,
        contractType: this.id,
        contractId: this.addContractDate.pkId ? this.addContractDate.pkId : "",
        customId: this.addContractDate.fkCustomerId,
        fkProfessionalTypeId: this.major
      };
      if (!!this.radioId) {
        data.sysItemDetailIds = this.radioId;
      } else if (this.checkList2.length) {
        data.sysItemDetailIds = this.checkList2.join(",");
      }

      if (this.id === 4) {
        data.customId = this.addContractDate.fkCustomerId;
      }
      console.log("222222222222222222222222");
      console.log(this.checkList2);
      console.log("222222222222222222222222");
      this.$api
        .searchContractItems(data)
        .then(res => {
          if (res.code == 200) {
            // this.deptOptions = this.formatData(res.data);
            this.deptOptions = res.data;
            this.$nextTick(() => {
              if (this.quanxian === 3 && this.$refs.tree) {
                const arr = this.$refs.tree.getCheckedNodes();
                if (arr.length) {
                  this.filterText = arr[0].itemName;
                  this.treeInput = true;
                }
              }
              if (isTrue) {
                let arr = this.dopeSheet.itemIds;
                this.$refs.tree.setCheckedKeys(arr);
              }
            });
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    //
    searchTemporaryItem(contractId, ids) {
      console.log(ids, this.dopeSheet);
      const data = { contractType: this.id, customId: this.addContractDate.fkCustomerId, contractId };
      this.$api.searchTemporaryItem(data).then(res => {
        if (res.code === 200) {
          this.temporaryList = res.data;
          // if (!!contractId && ids) {
          //   this.$refs.tree2.setCheckedKeys(ids);
          // }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 监理公司登录情况下获取建设单位和相应的项目
    searchBuildByOrgId() {
      this.$api.searchBuildByOrgId().then(res => {
        if (res.code === 200) {
          res.data.forEach(item => {
            item.customName = item.investorName;
          });
          this.constructionUnits = res.data;
          if (this.id === 2 && !!this.addContractDate.fkCustomerId) {
            // this.contractItem = res.data.filter(item => item.pkId === this.addContractDate.fkCustomerId)[0].projProjects;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 关闭模态框
    handleClose(isDel) {
      this.$emit("update:dialogVisible", false);
      this.addContractDate = {
        amount: "",
        signDate: "",
        beginDate: "",
        endDate: "",
        contractName: "",
        fkOrgId: null,
        amount: null,
        contractType: this.id,
        endDate: "",
        fkCustomerId: "",
        fkOrgId: "",
        fkProjectId: "",
        taxRate: ""
      };
      this.redList = [];
      this.materialType = "2";
      this.tableData = [];
      this.materialTable = [{ myId: 1, inventoryCode: "supply_noDeduction", isRemove: 0 }];
      this.materialTable2 = [{ myId: 1, inventoryCode: "supply_deduction", isRemove: 0 }];
      this.materialTable3 = [{ myId: 1, inventoryCode: "supply_other", isRemove: 0 }];
      this.contractItem = [];
      this.randeKeys = Math.random();
      this.tabs = "";
      this.lasetMaterCodeType = "";
      this.isMater = false;
      if (!isDel) {
        this.delList = [];
        this.delFiles();
      } else {
        this.newAddList = [];
        this.delFiles();
      }
    },
    // 删除附件
    delFiles() {
      let urls = [];
      if (!this.addContractDate.pkId) {
        urls = this.newAddList.join(",");
      } else {
        urls = [...new Set([...this.delList, ...this.newAddList])].join(",");
      }
      if (!urls.length) {
        return;
      }
      this.newAddList = [];
      this.delList = [];
      this.$api.delFiles({ urls });
    },
    // 清单模态框确定按钮
    handleOk() {
      if ([1, 2, 4].includes(this.id) && this.dopeSheet.inventoryCode !== "inventory_cost" && this.dopeSheet.inventoryCode != "inventory_itemize") {
        let nddArr = this.$refs.tree.getCheckedNodes();
        this.dopeSheet.itemIds = nddArr.map(item => item.pkId);
        let num = 0;
        nddArr.forEach(item => {
          num = num + Number(item.designQuantities);
        });
        this.dopeSheet.quantities = num;
        // subConProShowList
      }
      console.log("确认");
      // unitName
      let data = { ...this.dopeSheet };
      if (!data.myId && data.myId !== 0) {
        data = { ...data, myId: this.tableData.length ? this.getMaxId(this.tableData) + 1 : 0 };
      }
      if (this.id === 3 && !data.fkMaterialId) {
        return this.$message.warning("请选择物料");
      }
      if (this.id !== 3 && !data.detailName) {
        return this.$message.warning("请输入清单名称");
      }
      if (!data.contractNum && data.inventoryCode !== "inventory_cost" && data.inventoryCode !== "inventory_itemize") {
        return this.$message.warning("请输入合同数量");
      }
      // if (data.inventoryCode === "inventory_build" && data.quantities) {
      //   data.contractNum = data.quantities;
      // }
      if (!data.subitemNum) {
        return this.$message.warning("请输入子目号");
      }
      // inventory_cost
      if (!data.fkUnitId && data.inventoryCode !== "inventory_itemize") {
        return this.$message.warning("请选择单位");
      }
      console.log(data.price);
      if (data.price == "" && data.inventoryCode !== "inventory_cost" && data.inventoryCode !== "inventory_itemize") {
        return this.$message.warning("请输入清单价");
      }
      //
      // if (!data.unitSea && data.inventoryCode !== "inventory_cost") {
      //   return this.$message.warning("请选择单位");
      // }
      if (!data.amount && data.inventoryCode === "inventory_cost") {
        return this.$message.warning("请输入清单总额");
      }
      if ([1, 2, 4].includes(this.id) && !data.itemIds.length && data.inventoryCode !== "inventory_cost" && data.inventoryCode !== "inventory_itemize") {
        return this.$message.warning(data.inventoryCode === "inventory_cost" ? "请选择分项工程" : "请选择清单项目");
      }

      if (data.inventoryCode == "inventory_cost") {
        data.price = this.amount;
        data.contractNum = 1;
      }
      // if (this.tableData.filter(item => item.myId !== data.myId && item.subitemNum === data.subitemNum).length) { dopeSheet.quantities
      //   return this.$message.warning("子目号重复"); dopeSheet.quantities
      // }
      // if (
      //   this.tableData
      //     .filter(item => {
      //       if (item.pkId) {
      //         return item.pkId !== data.pkId;
      //       } else {
      //         return item.myId !== data.myId;
      //       }
      //     })
      //     .map(item => item.detailName)
      //     .filter(item => item === data.detailName).length
      // ) {
      //   return this.$message.warning(`${this.id === 3 ? "物料" : "工程名称"}不能重复`);
      // }
      this.unitData.forEach(item => {
        if (data.fkUnitId == item.pkId) {
          data.unitName = item.unitName;
        }
      });
      this.unitData2.forEach(item => {
        if (data.fkUnitId == item.pkId) {
          data.unitName = item.unitName;
        }
      });
      if (this.dopeSheet.inventoryCode === "inventory_build") {
        data.fkProfessionalTypeId = this.major;
      } else {
        data.fkProfessionalTypeId = "";
      }
      // if (data.inventoryCode === "inventory_cost") {
      //   data.costCodes = this.checkList;
      // }
      // debugger
      if (this.quanxian == 2) {
        // this.tableData.push(data);
        let stastus = false;
        this.tabsList.forEach(item => {
          item.details &&
            item.details.forEach(item2 => {
              if (!item2.nowEdit && item2.subitemNum == data.subitemNum) {
                stastus = true;
              }
            });
        });
        // if( this.tabsList[this.currentIndex].details.length != 0){
        //   this.tabsList[this.currentIndex].details.forEach(item=>{
        //     console.log(item,data);
        //     if(item.subitemNum == data.subitemNum){
        //       stastus = true
        //     }
        //   })
        // }
        if (stastus) {
          return this.$message.warning("字目号不能重复");
        }
        let arr = [];
        this.tabsList[this.currentIndex].details.forEach(item => {
          arr.push(item.detailName);
        });
        if (this.dopeSheet.inventoryCode != "inventory_build" && arr.includes(data.detailName)) {
          return this.$message.warning("清单名称不能重复");
        }

        this.tabsList[this.currentIndex].details.push(data);

        this.tabsList[this.currentIndex].details = this.tabsList[this.currentIndex].details.sort((a, b) => {
          const aParts = a.subitemNum.split("-");
          const bParts = b.subitemNum.split("-");
          const maxLength = Math.max(aParts.length, bParts.length);

          for (let i = 0; i < maxLength; i++) {
            const aNum = parseInt(aParts[i]) || 0;
            const bNum = parseInt(bParts[i]) || 0;
            if (aNum !== bNum) {
              return aNum - bNum;
            }
          }

          return a.localeCompare(b);
        });
      } else {
        let stastus = false;
        this.tabsList.forEach(item => {
          item.details.forEach(item2 => {
            console.log(item2, data, item2.subitemNum == data.subitemNum);
            if (!item2.nowEdit && item2.subitemNum == data.subitemNum) {
              stastus = true;
            }
          });
        });
        // if( this.tabsList[this.currentIndex].details.length != 0){
        //   this.tabsList[this.currentIndex].details.forEach(item=>{
        //     console.log(item,data);
        //     if(!item.nowEdit&&item.subitemNum == data.subitemNum){
        //       stastus = true
        //     }
        //   })
        // }
        if (stastus) {
          return this.$message.warning("字目号不能重复");
        }
        delete data.nowEdit;
        this.$set(this.tabsList[this.currentIndex].details, this.amendIndex, data);
        this.tabsList[this.currentIndex].details[this.amendIndex] = data;
        this.tabsList[this.currentIndex].details = this.tabsList[this.currentIndex].details.sort((a, b) => {
          const aParts = a.subitemNum.split("-");
          const bParts = b.subitemNum.split("-");
          const maxLength = Math.max(aParts.length, bParts.length);

          for (let i = 0; i < maxLength; i++) {
            const aNum = parseInt(aParts[i]) || 0;
            const bNum = parseInt(bParts[i]) || 0;
            if (aNum !== bNum) {
              return aNum - bNum;
            }
          }

          return a.localeCompare(b);
        });
      }
      if (this.isCheck) {
        this.lasetCheckCodeType = this.itemCodes.length;
      }
      if (this.id === 3 || (this.id === 4 && this.radio1 === 2)) {
        if (this.quanxian == 3 && this.openDetail.isChoose) {
          this.openDetail.isChoose = 0;
        }
        if (this.quanxian == 1 || (this.dialogShowType != 2 && this.quanxian == 3)) {
        } else {
          this.$refs.cascader.getCheckedNodes()[this.$refs.cascader.getCheckedNodes().length - 1].data.isChoose = 1;
        }
      }
      // if (this.id === 4 && this.radio1 === 1 && !this.tabs) {
      this.tabs = this.tabs ? this.tabs : this.tabsList[0].pkId;
      // }
      this.randeKeys = Math.random();
      this.handleClose2();
      // dopeSheet.quantities
      // debugger
    },
    // 关闭清单模态框
    handleClose2() {
      if (([1, 2].includes(this.id) && this.dopeSheet.inventoryCode === "inventory_build" && this.current === 2) || (this.id === 4 && this.radio1 === 1 && this.dopeSheet.inventoryCode === "inventory_build" && this.current === 2)) {
        this.$refs.tree.setCheckedKeys([]);
      }
      this.treeCheckAll = false;
      this.listInfoDialog = false;
      this.setInfo = [];
      this.checkList = [];
      this.checkList2 = [];
      this.detailsList = [];
      this.radioId = "";
      this.activeName = "1";
      this.major = "";
      this.onlyCheck = false;
      this.filterText2 = "";
      this.linkCheck = false;
      this.dopeSheet = {
        detailName: null, // 工程名称
        quantities: "", // 合同数量
        contractNum: "",
        fkUnitId: null, // 单位
        fkMaterialId: "",
        price: null, // 清单价
        amount: null, // 清单总额
        remark: null, // 备注
        itemIds: [], // 分项工程,
        inventoryCode: null,
        subitemNum: ""
      };
      this.unitSea = "";
      this.times = 0;
    },
    // 打开第二个模态框
    handleOpen(type, item, index) {
      if (!this.addContractDate.fkCustomerId) {
        return this.$message.warning(`请先选择${this.contracter}`);
      }
      if (this.id === 2 && !this.addContractDate.fkProjectId) {
        return this.$message.warning("请先选择标段项目");
      }
      if (type == 3) {
        item.nowEdit = true;
      }
      if ([1, 3].includes(type)) {
        this.current = 2;
      } else {
        this.current = 1;
      }
      this.quanxian = type;
      if (type == 2 || ([1, 3].includes(type) && item.inventoryCode == "inventory_build")) {
        this.searchMajorTypeList(type, item);
      }
      this.deptOptions = [];
      if (this.radio1 !== 2) {
        let arr = [];
        this.tabsList.forEach(item => {
          item.details.forEach(item2 => {
            item2.itemIds.forEach(item3 => arr.push(item3));
          });
        });
        if (item && item.itemIds.length) {
          item.itemIds.forEach(item => {
            arr = arr.filter(item2 => item !== item2);
          });
        }
        this.filterArr = arr;
      }
      this.listInfoDialog = true;
      if (type == 2) {
        this.material = "";
        this.dopeSheet = {
          detailName: null, // 工程名称
          quantities: "", // 合同数量
          contractNum: "",
          fkUnitId: null, // 单位
          fkMaterialId: "",
          price: "", // 清单价
          amount: null, // 清单总额
          remark: null, // 备注
          itemIds: [], // 分项工程
          inventoryCode: null,
          subitemNum: "",
          isAppearUpdate: 1,
          isDelete: 1,
          isUpdate: 1
        };
        if ((this.id === 4 && this.radio1 === 1) || [1, 2].includes(this.id)) {
          this.dopeSheet.inventoryCode = "inventory_build";
          // this.major = this.majorTypeList[0].pkId;
          // this.dopeSheet.fkProfessionalTypeId = this.majorTypeList[0].pkId;
        } else if (this.id === 4 && this.radio1 === 2) {
          this.dopeSheet.inventoryCode = "supply_noDeduction";
        }
        this.treeshow = false;
        this.$nextTick(() => {
          this.treeshow = true;
        });
      } else {
        this.dopeSheet = {
          ...item,
          itemIds: [...item.itemIds]
        };
        this.unitSea = item.unitName;
        this.setInfo = [...item.itemIds];
        this.amendIndex = index;
        if (item.inventoryCode == "inventory_cost") {
          // this.checkList = [...item.costCodes];
        } else {
          this.major = item.fkProfessionalTypeId + "";
        }
        // if (this.id == 3) {
        //   this.material = item.fkMaterialId;
        // } else if (this.id === 4) {
        //   if (item.inventoryCode == "inventory_cost") {
        //     this.checkList = [...item.costCodes];
        //   } else {
        //     this.major = item.fkProfessionalTypeId;
        //   }
        // }
        if (type == 1) {
          this.treeCheckAll = true;
        }
        this.treeshow = false;
        this.$nextTick(() => {
          if (this.dopeSheet.inventoryCode == "inventory_build") {
            this.treeshow = true;
            this.$nextTick(() => {
              this.$refs.tree.setCheckedKeys(item.itemIds);
            });
          }
          // if (this.id === 3 || (this.id === 4 && this.radio1 === 2)) {
          //   if (this.quanxian == 1 || (this.dialogShowType != 2 && this.quanxian == 3)) {
          //   } else {
          //     if (!!this.$refs.cascader.getCheckedNodes()[this.$refs.cascader.getCheckedNodes().length - 1]) {
          //       this.openDetail = this.$refs.cascader.getCheckedNodes()[this.$refs.cascader.getCheckedNodes().length - 1].data;
          //     }
          //   }
          // } else {
          //   if (this.dopeSheet.inventoryCode !== "inventory_cost") {
          //     this.treeshow = true;
          //     this.$nextTick(() => {
          //       this.$refs.tree.setCheckedKeys(item.itemIds);
          //     });
          //   }
          // }
        });
      }
    },
    // 删除
    handleDel(row, index) {
      this.$confirm("确定删除该清单信息？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        // if ([1, 4].includes(this.id) && row.isChoose === 1) return this.$message.warning("已有审批流程关联，不允许删除");
        // this.tableData = this.tableData.filter(item => item.myId !== row.myId);
        row.nowDel = true;
        this.tabsList.forEach(item => {
          if (item.chapterName == this.tabs) {
            item.details = item.details.filter(item => !item.nowDel);
          }
        });
        if (this.id === 3) {
          this.cleanDisabled(this.options, row.fkMaterialId);
        }
        this.randeKeys = Math.random();
        // if (!this.subConProShowList.length) {
        //   this.tabs = this.tabsList.length ? this.tabsList[0].chapterName : "";
        // }
      });
    },
    cleanDisabled(list, pkId) {
      for (let i = 0; i < list.length; i++) {
        if (list[i].pkId == pkId) {
          list[i].isChoose = 0;
          return;
        } else {
          if (list[i].childList) {
            this.cleanDisabled(list[i].childList, pkId);
          }
        }
      }
    },
    formatData(params) {
      const data = params;
      data.map(item => {
        if (item.hasOwnProperty("childList")) {
          item.disabled = true;
          this.formatData(item.childList);
        }
      });
      return data;
    },
    // 编辑、查看进入模态框调用的函数
    initialization(data) {
      this.projectId = data.fkProjectId;
      this.rowContractId = data.pkId;
      if (this.typeStatus) {
        this.$api.summaryContractById({ pkId: data.pkId }).then(res => {
          if (res.code == 200) {
            this.addContractDate = res.data;
            this.contractNumber = res.data.contractNumber;
            this.getBusinessCode(12, false);
            this.tabsList = res.data.contractChapters == null ? [] : res.data.contractChapters;
            if (res.data.contractChapters != null && res.data.contractChapters.length != 0) {
              this.tabs = res.data.contractChapters[0].chapterName;
              // this.currentIndex =  res.data.contractChapters[0].chapterName
            }
            console.log("===========================================");
            console.log(this.tabs);
            console.log("===========================================");
            // this

            if (this.id === 3) {
              // this.tableData = res.data.details ? res.data.details.map((item, index) => ({ ...item, myId: index })) : [{myId:1,inventoryType:2,fkMaterialId: "", isUpdate: 1, isDelete: 1},{myId:2,inventoryType:3,fkMaterialId: "", isUpdate: 1, isDelete: 1}];
              this.tableData = [];
              let arr1 = res.data.contractChapters[0].details;
              let arr2 = res.data.contractChapters[1].details;
              if (!arr1.length && this.dialogShowType !== 1) {
                this.tableData.push({
                  myId: this.getMaxId(this.tableData) + 1,
                  fkMaterialId: "",
                  isUpdate: 1,
                  isDelete: 1,
                  inventoryType: 2
                });
              } else {
                this.tableData = [...arr1.map((item, index) => ({ ...item, myId: index }))];
              }
              if (!arr2.length && this.dialogShowType !== 1) {
                this.tableData.push({
                  myId: this.getMaxId(this.tableData) + 1,
                  fkMaterialId: "",
                  isUpdate: 1,
                  isDelete: 1,
                  inventoryType: 3
                });
              } else {
                this.tableData = [...this.tableData, ...arr2.map((item, index) => ({ ...item, myId: this.getMaxId(this.tableData) + (index + 1) }))];
              }
            } else {
              this.tableData = res.data.details ? res.data.details.map((item, index) => ({ ...item, myId: index })) : [];
            }
            this.attachments = res.data.attachments ? res.data.attachments : [];
            if (res.data.materials) {
              if (this.dialogShowType === 1) {
                this.materialTable = res.data.materials.filter(item => item.inventoryCode === "supply_noDeduction").map((item, index) => ({ ...item, myId: index }));
                this.materialTable2 = res.data.materials.filter(item => item.inventoryCode === "supply_deduction").map((item, index) => ({ ...item, myId: index }));
                this.materialTable3 = res.data.materials.filter(item => item.inventoryCode === "supply_other").map((item, index) => ({ ...item, myId: index }));
              } else {
                this.materialTable = res.data.materials.filter(item => item.inventoryCode === "supply_noDeduction").length ? res.data.materials.filter(item => item.inventoryCode === "supply_noDeduction").map((item, index) => ({ ...item, myId: index })) : [{ myId: 1, inventoryCode: "supply_noDeduction", isRemove: 0 }];
                this.materialTable2 = res.data.materials.filter(item => item.inventoryCode === "supply_deduction").length ? res.data.materials.filter(item => item.inventoryCode === "supply_deduction").map((item, index) => ({ ...item, myId: index })) : [{ myId: 1, inventoryCode: "supply_deduction", isRemove: 0 }];
                this.materialTable3 = res.data.materials.filter(item => item.inventoryCode === "supply_other").length ? res.data.materials.filter(item => item.inventoryCode === "supply_other").map((item, index) => ({ ...item, myId: index })) : [{ myId: 1, inventoryCode: "supply_other", isRemove: 0 }];
              }
            } else {
              if (this.dialogShowType === 1) {
                this.materialTable = [];
                this.materialTable2 = [];
                this.materialTable3 = [];
              } else {
                this.materialTable = [{ myId: 1, inventoryCode: "supply_noDeduction", isRemove: 0 }];
                this.materialTable2 = [{ myId: 1, inventoryCode: "supply_deduction", isRemove: 0 }];
                this.materialTable3 = [{ myId: 1, inventoryCode: "supply_other", isRemove: 0 }];
              }
            }

            this.rowDates = res.data;
            if (this.user.orgType === 3) {
              this.searchBuildByOrgId();
            }

            // if (this.id == 3 || this.id == 4) {
            //   this.listAllAndMaterial(this.addContractDate.fkCustomerId);
            // }
            // this.searchMajorTypeList2(this.user.fkEnginerringTypeId, 2);
            this.radio1 = 1;
          } else {
            this.$message.warning(res.msg);
          }
        });
      } else {
        this.$api.getContractInfoById({ pkId: data.pkId }).then(res => {
          if (res.code == 200) {
            this.addContractDate = res.data;
            this.contractNumber = res.data.contractNumber;
            this.getBusinessCode(12, false);
            this.tabsList = res.data.contractChapters == null ? [] : res.data.contractChapters;
            if (res.data.contractChapters != null && res.data.contractChapters.length != 0) {
              this.tabs = res.data.contractChapters[0].chapterName;
              // this.currentIndex =  res.data.contractChapters[0].chapterName
            }
            console.log("===========================================");
            console.log(this.tabs);
            console.log("===========================================");
            // this

            if (this.id === 3) {
              // this.tableData = res.data.details ? res.data.details.map((item, index) => ({ ...item, myId: index })) : [{myId:1,inventoryType:2,fkMaterialId: "", isUpdate: 1, isDelete: 1},{myId:2,inventoryType:3,fkMaterialId: "", isUpdate: 1, isDelete: 1}];
              this.tableData = [];
              let arr1 = res.data.contractChapters[0].details;
              let arr2 = res.data.contractChapters[1].details;
              if (!arr1.length && this.dialogShowType !== 1) {
                this.tableData.push({
                  myId: this.getMaxId(this.tableData) + 1,
                  fkMaterialId: "",
                  isUpdate: 1,
                  isDelete: 1,
                  inventoryType: 2
                });
              } else {
                this.tableData = [...arr1.map((item, index) => ({ ...item, myId: index }))];
              }
              if (!arr2.length && this.dialogShowType !== 1) {
                this.tableData.push({
                  myId: this.getMaxId(this.tableData) + 1,
                  fkMaterialId: "",
                  isUpdate: 1,
                  isDelete: 1,
                  inventoryType: 3
                });
              } else {
                this.tableData = [...this.tableData, ...arr2.map((item, index) => ({ ...item, myId: this.getMaxId(this.tableData) + (index + 1) }))];
              }
            } else {
              this.tableData = res.data.details ? res.data.details.map((item, index) => ({ ...item, myId: index })) : [];
            }
            this.attachments = res.data.attachments ? res.data.attachments : [];
            if (res.data.materials) {
              if (this.dialogShowType === 1) {
                this.materialTable = res.data.materials.filter(item => item.inventoryCode === "supply_noDeduction").map((item, index) => ({ ...item, myId: index }));
                this.materialTable2 = res.data.materials.filter(item => item.inventoryCode === "supply_deduction").map((item, index) => ({ ...item, myId: index }));
                this.materialTable3 = res.data.materials.filter(item => item.inventoryCode === "supply_other").map((item, index) => ({ ...item, myId: index }));
              } else {
                this.materialTable = res.data.materials.filter(item => item.inventoryCode === "supply_noDeduction").length ? res.data.materials.filter(item => item.inventoryCode === "supply_noDeduction").map((item, index) => ({ ...item, myId: index })) : [{ myId: 1, inventoryCode: "supply_noDeduction", isRemove: 0 }];
                this.materialTable2 = res.data.materials.filter(item => item.inventoryCode === "supply_deduction").length ? res.data.materials.filter(item => item.inventoryCode === "supply_deduction").map((item, index) => ({ ...item, myId: index })) : [{ myId: 1, inventoryCode: "supply_deduction", isRemove: 0 }];
                this.materialTable3 = res.data.materials.filter(item => item.inventoryCode === "supply_other").length ? res.data.materials.filter(item => item.inventoryCode === "supply_other").map((item, index) => ({ ...item, myId: index })) : [{ myId: 1, inventoryCode: "supply_other", isRemove: 0 }];
              }
            } else {
              if (this.dialogShowType === 1) {
                this.materialTable = [];
                this.materialTable2 = [];
                this.materialTable3 = [];
              } else {
                this.materialTable = [{ myId: 1, inventoryCode: "supply_noDeduction", isRemove: 0 }];
                this.materialTable2 = [{ myId: 1, inventoryCode: "supply_deduction", isRemove: 0 }];
                this.materialTable3 = [{ myId: 1, inventoryCode: "supply_other", isRemove: 0 }];
              }
            }

            this.rowDates = res.data;
            if (this.user.orgType === 3) {
              this.searchBuildByOrgId();
            }

            // if (this.id == 3 || this.id == 4) {
            //   this.listAllAndMaterial(this.addContractDate.fkCustomerId);
            // }
            // this.searchMajorTypeList2(this.user.fkEnginerringTypeId, 2);
            this.radio1 = 1;
          } else {
            this.$message.warning(res.msg);
          }
        });
      }
    },
    // 新增进入模态框调用的函数
    empty() {
      this.tabsList = [];
      this.rowContractId = "";
      this.attachments = [];
      this.searchMajorTypeList2(this.user.fkEnginerringTypeId, 1);
      // if (this.id === 3) {
      //   this.listAllAndMaterial();
      // }
      console.log("xxxxxxxxxxxxxxxxxxxxxx");
      console.log(this.tabsList);
      console.log("xxxxxxxxxxxxxxxxxxxxxx");
      this.contractNumber = "";
      this.getBusinessCode(12, true);
    },
    // 获取合同编号
    getBusinessCode(businessType, type) {
      this.$api.getBusinessCode({ businessType }).then(res => {
        if (res.code === 200) {
          if (type) {
            this.contractNumber = res.data.typeCode;
          }
          this.allowModifyStatus = res.data.allowModify == 1 ? true : false;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 树形禁用
    treeDisable(data, node) {
      if (this.quanxian === 1) {
        return true;
      }
      if (data.whetherOccupy === 0) {
        return true;
      }
      if (data.isChooseByArea) {
        return true;
      }
      if (this.filterArr.includes(data.pkId)) {
        return true;
      }
      return false;
    },
    // 树形筛选
    filterNode(value, data, node) {
      if (this.onlyCheck) {
        // return (node.checked && data.grade == 4 && data.itemName.indexOf(value) !== -1) || (node.indeterminate && data.grade == 4 && data.itemName.indexOf(value) !== -1);
        return !this.filterArr.includes(data.pkId) && data.whetherOccupy !== 0 && !data.isChooseByArea && data.grade == 4;
      } else {
        // if (value) {
        //   return data.grade == 4 && data.itemName.indexOf(value) !== -1;
        // } else {
        return true;
        // }
      }
    },
    contraChange(e) {
      if (this.id === 3) {
        this.tableData = [
          { myId: 1, inventoryType: 2, fkMaterialId: "", isUpdate: 1, isDelete: 1 },
          { myId: 2, inventoryType: 3, fkMaterialId: "", isUpdate: 1, isDelete: 1 }
        ];
      } else {
        this.tableData = [];
      }
      if (this.id === 2) {
        let arr = this.constructionUnits.filter(item => item.pkId === this.addContractDate.fkProjectId);
        // this.contractItem = arr[0].projProjects;
        this.addContractDate.fkCustomerId = arr[0].fkCustomId;
        this.addContractDate.superiorOrgName = arr[0].contractorName;
        this.addContractDate.customerOrgName = arr[0].investorName;
      }
      if (this.id === 4) {
        // this.tableData = [];
        this.materialTable = [{ myId: 1, inventoryCode: "supply_noDeduction", isRemove: 0 }];
        this.materialTable2 = [{ myId: 1, inventoryCode: "supply_deduction", isRemove: 0 }];
        this.materialTable3 = [{ myId: 1, inventoryCode: "supply_other", isRemove: 0 }];
        // this.listAllAndMaterial(e);
        // if (this.id === 4) {
        //   this.tableData = [];
        //   this.materialTable = [];
        // }
      }
    },
    // 数字输入框禁止输入事件
    channelInputLimit(e, type) {
      const key = e.key;
      if (type === 1) {
        if (key === "e" || key === "-") {
          e.returnValue = false;
          return false;
        }
      } else {
        if (key === "e" || key === "." || key === "-") {
          e.returnValue = false;
          return false;
        }
      }
      return true;
    },
    // 输入内容验证
    oninput2(e, type) {
      this.$nextTick(() => {
        let val = e;
        val = val.replace(/[^\d.]/g, ""); // 清除"数字"和"."以外的字符
        val = val.replace(/\.{2,}/g, "."); // 只保留第一个. 清除多余的
        val = val.replace(/^0+\./g, "0.");
        val = val.match(/^0+[1-9]+/) ? (val = val.replace(/^0+/g, "")) : val;
        val = val.match(/^\d*(\.?\d{0,2})/g)[0] || "";
        if (val.includes(".")) {
          // let numDian = val.toString().split(".")[1].length;
          // if (numDian === 2) {
          this.moneyMaxLeng = 15;
          // }
        } else {
          this.moneyMaxLeng = 12;
        }

        if (type === 1) {
          this.addContractDate.amount = val;
        } else {
          this.dopeSheet.price = val;
        }
      });
    },
    oninput3(e) {
      this.$nextTick(() => {
        let val = e;
        val = val.replace(/[^\d.]/g, ""); // 清除"数字"和"."以外的字符
        val = val.replace(/\.{2,}/g, "."); // 只保留第一个. 清除多余的
        val = val.replace(/^0+\./g, "0.");
        val = val.match(/^0+[1-9]+/) ? (val = val.replace(/^0+/g, "")) : val;
        val = val.match(/^\d*(\.?\d{0,6})/g)[0] || "";

        if (val.includes(".")) {
          this.moneyMaxLeng2 = 15;
        } else {
          this.moneyMaxLeng2 = 12;
        }
        this.dopeSheet.contractNum = val;
      });
    },
    delAttach(data) {
      this.$api.delFiles({ urls: data.attachUrl });
      this.attachments = this.attachments.filter(item => item.attachUrl !== data.attachUrl);
      this.delList.push(data.attachUrl);
    },
    // 树形超过宽度提示
    onMouseEnter(str) {
      const tag = this.$refs[str];
      const parentWidth = tag.parentNode.offsetWidth; // 获取元素父级可视宽度
      const contentWidth = tag.offsetWidth; // 获取元素可视宽度
      this.isShowTooltip = contentWidth <= parentWidth;
    },
    detailTypeChange(e) {
      console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
      console.log(e);
      console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
      this.dopeSheet.detailName = "";
      this.dopeSheet.contractNum = "";
      this.dopeSheet.quantities = "";
      this.dopeSheet.fkUnitId = "";
      this.dopeSheet.price = "";
      this.dopeSheet.amount = "";
      this.dopeSheet.itemIds = [];
      this.dopeSheet.remark = "";
      this.onlyCheck = false;
      this.filterText = "";
      this.checkList = [];
      if (e === "inventory_build") {
        this.major = this.majorTypeList.length ? this.majorTypeList[0].pkId : "";
        this.treeshow = true;
      } else if (e == "inventory_itemize") {
      } else {
        this.major = "";
      }
    },
    // 清单模态框确定按钮
    handleOk2() {
      let data = { ...this.metralForm };
      if (!data.materialName) {
        return this.$message.warning("请选择物料");
      }
      if (!data.excessPrice && data.inventoryCode == "supply_noDeduction") {
        return this.$message.warning("请填写超额扣款单价");
      }
      if (!data.supplyNum) {
        return this.$message.warning(`请填写${data.inventoryCode == "supply_noDeduction" ? "限额供应量" : "供应数量"}`);
      }
      if (!data.supplyPrice) {
        return this.$message.warning(`请填写${data.inventoryCode == "supply_noDeduction" ? "材料价格" : "供应单价"}`);
      }
      if (!data.myId) {
        data = { ...data, myId: this.materialTable.length ? this.getMaxId(this.materialTable) + 1 : 0 };
      }
      if (
        this.materialTable
          .filter(item => {
            if (item.pkId) {
              return item.pkId !== data.pkId;
            } else {
              return item.myId !== data.myId;
            }
          })
          .map(item => item.materialName)
          .includes(data.materialName)
      ) {
        return this.$message.warning("物料不能重复");
      }
      this.unitData.forEach(item => {
        if (data.fkUnitId == item.pkId) {
          data.unitName = item.unitName;
        }
      });
      if (this.quanxian == 2) {
        this.materialTable.push(data);
      } else {
        this.$set(this.materialTable, this.amendIndex, data);
        // this.materialTable[this.amendIndex] = data;
      }

      if (this.quanxian == 3 && this.openDetail.isChoose) {
        this.openDetail.isChoose = 0;
      }
      if (this.quanxian == 1 || (this.dialogShowType != 2 && this.quanxian == 3)) {
      } else {
        this.$refs.cascader2.getCheckedNodes()[this.$refs.cascader2.getCheckedNodes().length - 1].data.isChoose = 1;
      }
      this.randeKeys = Math.random();
      this.handleClose3();
    },
    // 关闭清单模态框
    handleClose3() {
      this.MetralDialog = false;
      this.metralForm = {
        detailName: "", // 物料名称
        excessPrice: "", // 超额扣款单价
        fkMaterialId: "", // 供货物料ID
        inventoryCode: "", // 供应方式编码
        remark: "", // 备注
        supplyNum: "", // 供应数量/限额供应量
        supplyPrice: "", // 供应单价
        materialTypeName: "",
        unitName: ""
      };
    },
    // 打开第三个模态框
    handleOpen3(type, item, index) {
      if (!this.addContractDate.fkCustomerId) {
        return this.$message.warning("请先选择分包单位商");
      }
      // if (type === 1) {
      //   this.allCategory(item.pkId);
      // } else {
      //   this.allCategory();
      // }
      this.quanxian = type;
      this.MetralDialog = true;
      if (type == 2) {
        this.material = "";
        this.metralForm = {
          materialName: "", // 物料名称
          excessPrice: "", // 超额扣款单价
          fkMaterialId: "", // 供货物料ID
          inventoryCode: "", // 供应方式编码
          remark: "", // 备注
          supplyNum: "", // 供应数量/限额供应量
          supplyPrice: "", // 供应单价
          materialTypeName: "",
          unitName: ""
        };
        this.metralForm.inventoryCode = "supply_noDeduction";
      } else {
        this.metralForm = { ...item };
        this.amendIndex = this.materialTable.findIndex(it => it.myId === item.myId);
        this.material = item.fkMaterialId;
        this.$nextTick(() => {
          if (this.quanxian == 1 || (this.dialogShowType != 2 && this.quanxian == 3)) {
          } else {
            if (this.$refs.cascader2.getCheckedNodes()[this.$refs.cascader2.getCheckedNodes().length - 1]) {
              this.openDetail = this.$refs.cascader2.getCheckedNodes()[this.$refs.cascader2.getCheckedNodes().length - 1].data;
            }
          }
        });
      }
    },
    // 删除
    handleDel2(row, index) {
      this.$confirm("确定删除该物料信息？", "删除确认", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.materialTable = this.materialTable.filter(item => item.myId !== row.myId);
        this.randeKeys = Math.random();
        this.cleanDisabled(this.options, row.fkMaterialId);
      });
    },
    secondInput(e) {
      if (e.indexOf(".") !== -1) {
        const length = e.substr(e.indexOf(".") + 1).length;
        if (length == 1) {
          this.secondMaxLength = 14;
        } else if (length === 2) {
          this.secondMaxLength = 15;
        } else {
          this.secondMaxLength = 13;
        }
      } else {
        this.secondMaxLength = 12;
      }
    },
    // 物料表加号事件
    addMater(type) {
      if (type === 1) {
        this.tableData.push({
          myId: this.getMaxId(this.tableData) + 1,
          fkMaterialId: "",
          amount: 0,
          isDelete: 1,
          isUpdate: 1,
          inventoryType: this.materialType
        });

        // this.$nextTick(() => {
        //   this.$refs.tableData.bodyWrapper.scrollTop = this.$refs.tableData.bodyWrapper.scrollHeight;
        // });
      } else if (type === 2) {
        this.materialTable.push({
          myId: this.getMaxId(this.materialTable) + 1,
          fkMaterialId: "",
          inventoryCode: "supply_noDeduction",
          isRemove: 0
        });
        // this.$nextTick(() => {
        //   this.$refs.putmaterialList.bodyWrapper.scrollTop = this.$refs.putmaterialList.bodyWrapper.scrollHeight;
        // });
      } else if (type === 3) {
        this.materialTable2.push({
          myId: this.getMaxId(this.materialTable2) + 1,
          fkMaterialId: "",
          inventoryCode: "supply_deduction",
          isRemove: 0
        });
        // this.$nextTick(() => {
        //   this.$refs.putmaterialList.bodyWrapper.scrollTop = this.$refs.putmaterialList.bodyWrapper.scrollHeight;
        // });
      } else if (type == 4) {
        this.materialTable3.push({
          myId: this.getMaxId(this.materialTable3) + 1,
          fkMaterialId: "",
          inventoryCode: "supply_other",
          isRemove: 0
        });
      }
    },
    // 物料表减号事件
    delMater(row, index, type) {
      // return console.log(type)
      if ([2, 3].includes(type) && row.isRemove === 1) {
        return this.$message.warning("此物料已产生关联数据,不允许删除");
      }
      if (type === 1) {
        // debugger
        if (this.materialList.length === 1) {
          this.tableData = this.tableData.filter(item => item.inventoryType != this.materialType);
          this.tableData.push({
            myId: this.getMaxId(this.tableData) + 1,
            fkMaterialId: "",
            isUpdate: 1,
            isDelete: 1,
            inventoryType: this.materialType
          });
        } else {
          this.tableData = this.tableData.filter(item => item.myId != row.myId);
          // this.tableData
          // this.materialList= this.materialList.splice(index, 1);
        }
      } else if (type === 2) {
        if (this.materialTable.length === 1) {
          this.materialTable = [
            {
              myId: 1,
              fkMaterialId: "",
              inventoryCode: "supply_noDeduction",
              isRemove: 0
            }
          ];
        } else {
          this.materialTable.splice(index, 1);
        }
      } else if (type === 3) {
        if (this.materialTable2.length === 1) {
          this.materialTable2 = [
            {
              myId: 1,
              fkMaterialId: "",
              inventoryCode: "supply_deduction",
              isRemove: 0
            }
          ];
        } else {
          this.materialTable2.splice(index, 1);
        }
      } else if (type == 4) {
        if (this.materialTable3.length === 1) {
          this.materialTable3 = [
            {
              myId: 1,
              fkMaterialId: "",
              inventoryCode: "supply_other",
              isRemove: 0
            }
          ];
        } else {
          this.materialTable3.splice(index, 1);
        }
      }
    },
    // 选择物料弹框
    selectMater(row) {
      if ((this.id === 4 && row.isRemove === 1) || (this.id === 3 && row.isUpdate === 0)) {
        return;
      }
      if (this.id === 3 && !this.addContractDate.fkCustomerId) {
        return this.$message.warning("请选择供应商");
      }
      if (this.id === 4 && !this.addContractDate.fkCustomerId) {
        return this.$message.warning("请选择分包单位");
      }
      this.nowAddMaterObj = row;
      this.materDialog = true;
    },
    // 在选择物料弹框获取到的物料信息
    getSelect(row) {
      this.$set(this.nowAddMaterObj, "pkId", row.pkId);
      if (row.showType) {
        this.$set(this.nowAddMaterObj, "fkMaterialId", row.pkId);
        this.$set(this.nowAddMaterObj, "fkMaterialTypeId", row.parentId);
      } else {
        this.$set(this.nowAddMaterObj, "fkMaterialId", "0");
        this.$set(this.nowAddMaterObj, "fkMaterialTypeId", row.pkId);
      }

      if (this.id === 3) {
        this.$set(this.nowAddMaterObj, "subitemNum", this.nowAddMaterObj.subitemNum ? this.nowAddMaterObj.subitemNum : "");
        this.$set(this.nowAddMaterObj, "detailName", row.typeName);
        this.$set(this.nowAddMaterObj, "fkTypeName", row.materialTypeName);
        this.$set(this.nowAddMaterObj, "unitName", row.unitName);
        // this.$set(this.nowAddMaterObj, "fkUnitId", row.fkUnitId);
        this.$set(this.nowAddMaterObj, "remark", "");
        this.$set(this.nowAddMaterObj, "amount", 0);
        this.$set(this.nowAddMaterObj, "price", "");
        this.$set(this.nowAddMaterObj, "contractNum", "");
        this.$set(this.nowAddMaterObj, "showType", row.showType);
      } else if (this.id === 4) {
        if (this.tabs2 === "supply_deduction") {
          this.$set(this.nowAddMaterObj, "supplyPrice", "");
        } else {
          this.$set(this.nowAddMaterObj, "excessPrice", "");
        }
        this.$set(this.nowAddMaterObj, "subitemNum", this.nowAddMaterObj.subitemNum ? this.nowAddMaterObj.subitemNum : "");
        // this.$set(this.nowAddMaterObj, "inventoryCode", this.tabs2);
        this.$set(this.nowAddMaterObj, "materialName", row.typeName);
        this.$set(this.nowAddMaterObj, "materialTypeName", row.materialTypeName);
        this.$set(this.nowAddMaterObj, "unitName", row.unitName);
        this.$set(this.nowAddMaterObj, "supplyNum", "");
        this.$set(this.nowAddMaterObj, "remark", "");
        console.log("========================");
        console.log(row);
        console.log("========================");
        this.$set(this.nowAddMaterObj, "showType", row.childList == null ? true : false);
        this.$set(this.nowAddMaterObj, "fkMaterialId", row.childList == null ? row.pkId : "0");
        this.$set(this.nowAddMaterObj, "fkMaterialTypeId", row.childList == null ? row.parentId : row.pkId);
      }
      // this.randomKey2 = Math.random();
    },
    linkCheckChange(val) {
      if (val) {
        this.checkList2 = [this.radioId];
      } else {
        this.checkList2 = [];
        this.dopeSheet.quantities = 0;
      }
      this.radioId = "";
    },
    changeCurrent(type) {
      if (type === 1) {
        this.current = 2;
        this.allCategory("", true);
      } else if (type === 2) {
        if (this.times === 0) {
          console.log(this.checkList2);

          // return

          this.times++;
          let arr = this.$refs.tree.getCheckedNodes();
          let newArr = Array.from(new Set(arr.map(item => item.fkSysItemDetailId)));
          if (this.linkCheck) {
            this.linkCheck = true;
            this.checkList2 = this.checkList2;
            // checkList2
          } else {
            this.linkCheck = false;
            this.radioId = !!newArr.length ? newArr[0] : this.radioId;
          }
        }
        this.current = 1;
        this.onlyCheck = false;
        // this.dopeSheet.quantities = 0;
      }
    },
    sortList(list) {
      let arr1 = list.filter(item => item.subitemNum);
      let arr2 = list.filter(item => !item.subitemNum);
      let arr3 = arr1.sort((a, b) => {
        const aParts = a.subitemNum.split("-");
        const bParts = b.subitemNum.split("-");
        const maxLength = Math.max(aParts.length, bParts.length);

        for (let i = 0; i < maxLength; i++) {
          const aNum = parseInt(aParts[i]) || 0;
          const bNum = parseInt(bParts[i]) || 0;
          if (aNum !== bNum) {
            return aNum - bNum;
          }
        }

        return a.localeCompare(b);
      });
      const arr = [...arr3, ...arr2];
      return arr;
    },
    changeItemCode() {
      // this.$set(this.nowClick,'subitemNum',this.itemCodes.join("-"))
      console.log(this.changeItemCodeDialogType, this.itemCodes.length);
      if (this.changeItemCodeDialogType < this.itemCodes.length) {
        this.itemCodes.splice(this.changeItemCodeDialogType, 4);
      }
      for (let i = 0; i < this.itemCodes.length; i++) {
        if (!this.itemCodes[i]) {
          return this.$message.warning("请输入正确的子目号");
        }
      }
      if (this.id === 4) {
        if (this.itemCodeType === 2) {
          let concatList = [];
          this.tabsList.forEach(item => {
            concatList = [...concatList, ...item.details];
          });
          if (concatList.filter(item => item.subitemNum === this.itemCodes.join("-")).length) {
            return this.$message.warning("子目号重复");
          }
          let arr = this.materialTable.filter(item => item.subitemNum === this.itemCodes.join("-"));
          let arr2 = this.materialTable2.filter(item => item.subitemNum === this.itemCodes.join("-"));
          let arr3 = this.materialTable3.filter(item => item.subitemNum === this.itemCodes.join("-"));
          if (this.tabs2 == "supply_noDeduction") {
            if (arr.filter(item => item.myId !== this.nowClick.myId).length || arr2.length || arr3.length) {
              return this.$message.warning("子目号重复");
            }
          } else if (this.tabs2 == "supply_deduction") {
            if (arr2.filter(item => item.myId !== this.nowClick.myId).length || arr.length || arr3.length) {
              return this.$message.warning("子目号重复");
            }
          } else if (this.tabs2 == "supply_other") {
            if (arr3.filter(item => item.myId !== this.nowClick.myId).length || arr.length || arr2.length) {
              return this.$message.warning("子目号重复");
            }
          }
        } else if (this.itemCodeType === 3) {
          let concatList = [];
          this.tabsList.forEach(item => {
            concatList = [...concatList, ...item.details];
          });
          let arr = this.materialTable.filter(item => item.subitemNum === this.itemCodes.join("-"));
          let arr2 = this.materialTable2.filter(item => item.subitemNum === this.itemCodes.join("-"));
          let arr3 = this.materialTable3.filter(item => item.subitemNum === this.itemCodes.join("-"));
          let bool = false;
          if (this.quanxian == 2) {
            bool = !!concatList.filter(item => item.subitemNum === this.itemCodes.join("-")).length;
          } else {
            bool = !!concatList.filter(item => item.myId !== this.nowClick.myId && item.subitemNum === this.itemCodes.join("-")).length;
          }
          if (bool || arr.length || arr2.length || arr3.length) {
            return this.$message.warning("子目号重复");
          }
        }
      } else if (this.id == 3) {
        console.log(this.tableData);
        if (this.tableData.filter(item => item.myId !== this.nowClick.myId && item.subitemNum === this.itemCodes.join("-")).length) {
          return this.$message.warning("子目号重复");
        }
      }
      this.nowClick.subitemNum = this.itemCodes.join("-");
      if (this.id == 3) {
        this.tableData = this.sortList(this.tableData);
      } else if (this.id == 4) {
        if (this.itemCodeType === 2) {
          if (this.tabs2 == "supply_noDeduction") {
            this.materialTable = this.sortList(this.materialTable);
          } else if (this.tabs2 == "supply_deduction") {
            this.materialTable2 = this.sortList(this.materialTable2);
          } else if (this.tabs2 == "supply_other") {
            this.materialTable3 = this.sortList(this.materialTable3);
          }
        }
      }
      if (this.isMater) {
        this.lasetMaterCodeType = this.itemCodes.length;
      }
      this.closeChangeItemCodeDialog();
    },
    changeInputEnter(type) {
      if (!this.itemCodes[type - 1]) return;
      if (type == 1 && this.changeItemCodeDialogType > 1) {
        this.$refs.changeInput2.focus();
      }
      if (type == 2 && this.changeItemCodeDialogType > 2) {
        this.$refs.changeInput3.focus();
      }
      if (type == 3 && this.changeItemCodeDialogType > 3) {
        this.$refs.changeInput4.focus();
      }
      if (type == 4 && this.changeItemCodeDialogType > 4) {
        this.$refs.changeInput5.focus();
      }
      if (type == 1 && this.changeItemCodeDialogType == 1) {
        this.changeItemCode();
      }
      if (type == 2 && this.changeItemCodeDialogType == 2) {
        this.changeItemCode();
      }
      if (type == 3 && this.changeItemCodeDialogType == 3) {
        this.changeItemCode();
      }
      if (type == 4 && this.changeItemCodeDialogType == 4) {
        this.changeItemCode();
      }
    },
    openChangeItemCodeDialog(row, type) {
      if (typeof row.subitemNum !== "string") {
        this.$set(row, "subitemNum", "");
        // row.subitemNum=''
      }
      this.itemCodeType = type;
      this.nowClick = row;
      this.itemCodes = row.subitemNum.split("-");
      if (type == 2) {
        this.isMater = true;
      } else {
        this.isMater = false;
      }
      if (type == 3) {
        this.isCheck = true;
      } else {
        this.isCheck = false;
      }
      if (type == 2 && !row.subitemNum) {
        this.changeItemCodeDialogType = this.lasetMaterCodeType ? this.lasetMaterCodeType : 1;
      } else if (type == 3 && !row.subitemNum) {
        this.changeItemCodeDialogType = this.lasetCheckCodeType ? this.lasetCheckCodeType : 1;
      } else {
        this.changeItemCodeDialogType = this.itemCodes.length;
      }
      this.changeItemCodeDialog = true;
      this.$nextTick(() => {
        this.$refs.changeInput.focus();
      });
    },
    closeChangeItemCodeDialog() {
      this.changeItemCodeDialog = false;
      this.changeItemCodeDialogType = 1;
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
    dataExport() {
      this.loading = true;
      this.$api
        .contentExport({ contractId: this.rowContractId })
        .then(res => {
          this.loading = false;
          if (res.code === 200) {
            utils.downFile(res.data.tableFileUrl, res.data.fileName);
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    dataPrinting() {
      this.loading = true;
      this.$api
        .contentPrint({ contractId: this.rowContractId })
        .then(res => {
          this.loading = false;
          if (res.code === 200) {
            printJS({ printable: res.data.tableFileUrl, type: "pdf" });
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    }
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        if (this.user.orgType === 3) {
          this.searchBuildByOrgId();
        } else {
          this.projCustomSearch();
        }
        // let typeId = this.user.orgType === 5 ? this.user.fkEnginerringTypeId : "";
        this.conditionUnits();
        this.getItemClass(10);
        this.getItemClass(11);
        this.getItemClass(15);
        if (this.id === 4) {
          this.radio1 = 1;
        }
        if (this.id === 3 && this.dialogShowType === 2) {
          this.tableData = [
            { myId: 1, inventoryType: 2, fkMaterialId: "", isUpdate: 1, isDelete: 1 },
            { myId: 2, inventoryType: 3, fkMaterialId: "", isUpdate: 1, isDelete: 1 }
          ];
        }
        // this.queriesProjectById();
        if (this.dialogShowType != 1) {
          this.$nextTick(() => {
            this.rowDrop();
          });
        } else {
          this.tagsObject.destroy();
        }
      }
    },
    filterText(val) {
      this.$refs.tree.filter(val);
    },
    onlyCheck() {
      this.$refs.tree.filter();
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/ .custom-dialog {
  width: 1400px;
  height: 800px;
  .dialog-form {
    display: flex;
    margin: 0;
  }
  .el-dialog__footer {
    width: 100%;
    position: absolute;
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: flex-end;
    .btns {
      height: 40px;
      width: 200px;
      background-color: #2a82e4;
    }
    .btn-cols {
      width: 100px;
      background-color: #eeeeee;
      color: #aaaaaa;
    }
  }
}

.baseInfo {
  width: 400px;
  .main {
    margin-bottom: 10px;
    border-top: 0;
    padding: 0 34px;
    overflow-y: scroll;
    max-height: 610px;
    span {
      margin-right: 10px;
    }
    .main-model {
      // display: flex;
      // justify-content: flex-start;
    }
    .main-item {
      display: flex;
      margin-bottom: 20px;
      .downloadBtn {
        padding: 5px 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #fdf6ec;
        color: #fff;
      }
      .labe-title {
        width: 90px;
        height: 40px;
        line-height: 40px;
        text-align: right;
        font-size: 14px;
        font-weight: 600;
        color: #203457;
      }
      .project-img-btn {
        flex: 1;
        position: relative;
        color: #2a82e4;
        background-color: #f9f9ff;
        border: 1px solid #dde2f0;
        margin: 0;
        padding-left: 12px;
        line-height: 40px;
        text-decoration: underline;
        cursor: pointer;
        .filebtn {
          cursor: pointer;
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          width: 100%;
          line-height: 40px;
          outline: medium none;
          -moz-opacity: 0;
          opacity: 0;
          filter: alpha(opacity=0);
        }
      }

      /deep/ .el-input {
        flex: 1;
      }
      /deep/ .el-input__inner {
        height: 40px;
        line-height: 40px;
        flex: 1;
        padding-right: 25px;
        background-color: #f9f9ff;
      }
      /deep/ .el-select {
        flex: 1;
      }

      /deep/ .el-input.is-disabled .el-input__inner {
        background-color: #f3f3f3 !important;
      }
    }
    .main-items {
      margin: 10px;
      .downloadBtn {
        padding: 5px 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: #fdf6ec;
        color: #fff;
      }
      .labe-title {
        display: inline-block;
        width: 90px;
        text-align: right;
      }

      .wh-700 {
        width: 700px;
      }
      .wh-800 {
        width: 806px;
      }
      .ml-50 {
        margin-left: 44px;
      }
    }
  }
}
.listInfo {
  flex: 1;
  margin-right: 20px;
  overflow: auto;
  .main {
    height: 550px;
    border: 1px solid #e7e7e7;
  }
  /deep/ .el-tabs__header {
    height: 41px;
  }
  /deep/ .el-tabs__nav {
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
  }
  /deep/ .el-tabs__item {
    color: #8b95a6 !important;
    background-color: #f6f6f6 !important;
    border: none !important;
    margin-right: 2px;
  }
  /deep/ .el-tabs__item.is-active {
    color: #203457 !important;
    background-color: #fff !important;
    border-bottom: 1px solid #fff !important;
    border-top: 1px solid #fff !important;
    border-right: 1px solid #fff !important;
    border-left: 1px solid #fff !important;
    height: 41px;
  }
  /deep/ .el-tooltip {
    display: inline;
  }
  // .container {
  /deep/ .el-tooltip {
    display: inline-block;
    line-height: 1;
    max-width: 120px !important; /* 设置容器宽度 */
    white-space: nowrap; /* 不换行 */
    overflow: hidden; /* 隐藏溢出内容 */
    text-overflow: ellipsis; /* 使用省略号表示被截断的部分 */
  }
}
.header {
  position: absolute;
  left: 0;
  top: 48px;
  width: 100%;
  padding: 0 20px 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 90px;
  h3 {
    width: 69%;
    color: #000000;
    font-size: 24px;
    white-space: nowrap; /* 不换行 */
    overflow: hidden; /* 隐藏溢出内容 */
    text-overflow: ellipsis; /* 使用省略号表示被截断的部分 */
  }
  .print-export {
    // position: absolute;
    // top: 7px;
    // right: 30px;
    .el-button-primary {
      width: 200px;
      height: 40px;
    }
    .educe {
      background-color: #43cf7c !important;
      border-color: #43cf7c !important;
    }
  }
}
.listDialog {
  display: flex;
  padding: 20px;
  .listDialog-right {
    width: 450px;
    // height: 500px;
    .tree {
      border: 1px solid #f3f3f3;
      border-top: 0;
    }
  }
  .listDialog-left {
    width: 450px;
    margin-right: 10px;
  }
  /deep/ .el-form-item {
    margin-bottom: 10px;
  }
}

.wrap {
  // width: 400px;
  /deep/ .el-tree-node {
    .is-leaf + .el-checkbox .el-checkbox__inner {
      display: inline-block;
    }
    .el-checkbox .el-checkbox__inner {
      display: none;
    }
  }
}
.main-item3 {
  width: 100%;
  padding-left: 100px;
  position: relative;
  .labe-title3 {
    position: absolute;
    left: 36px;
    top: 9px;
    font-size: 14px;
    font-weight: 600;
    color: #203457;
  }
}
.suee-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #203457;
  background-color: #f9f9ff;
  border: 1px solid #dde2f0;
  height: 40px;
  padding: 0 10px;
  margin-bottom: 10px;
  position: relative;
  .attachName {
    white-space: nowrap; /* 保证文字在同一行显示 */
    overflow: hidden; /* 隐藏超出容器的文字 */
    text-overflow: ellipsis; /* 添加省略号表示文字被截断 */
    cursor: pointer;
  }
  .dowl {
    height: 26px;
  }
  .el-icon-delete {
    position: absolute;
    right: -22px;
    top: 12px;
    color: #0c457a;
  }
}
/deep/ .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner {
  background-color: #409eff !important;
  border-color: #409eff !important;
}
/deep/ .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
  border-color: #ffffff;
}
.del {
  cursor: pointer;
  color: red;
}
/deep/ .el-tree {
  height: 534px;
  overflow: auto;
  .label1 {
    width: 360px;
    overflow: hidden; /*超出部分隐藏*/
    white-space: nowrap; /*禁⽌换⾏*/
    text-overflow: ellipsis; /*省略号*/
  }
  .label2 {
    width: 340px;
    overflow: hidden; /*超出部分隐藏*/
    white-space: nowrap; /*禁⽌换⾏*/
    text-overflow: ellipsis; /*省略号*/
  }
  .label3 {
    width: 320px;
    overflow: hidden; /*超出部分隐藏*/
    white-space: nowrap; /*禁⽌换⾏*/
    text-overflow: ellipsis; /*省略号*/
  }
  .label4 {
    width: 300px;
    overflow: hidden; /*超出部分隐藏*/
    white-space: nowrap; /*禁⽌换⾏*/
    text-overflow: ellipsis; /*省略号*/
  }
}
.major {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  .label {
    width: 80px;
    margin-right: 5px;
  }
  // .el-select{
  //   width: calc(100% - 80px);
  // }
}
.tree-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .el-input {
    width: 50%;
  }
  .el-checkbox {
    margin-right: 5px;
  }
}
.radios {
  position: relative;
  text-align: center;
  .addbtn {
    position: absolute;
    right: 20px;
    top: 50px;
    z-index: 999;
  }
}
.checkeds {
  height: 470px;
  padding: 0 5px;
  overflow: auto;
}
.checkeds2 {
  height: 430px;
  padding: 0 5px;
  overflow: auto;
}
.checkboxWidth {
  width: 100%;
  margin: 5px 0;
}
.selectFac {
  cursor: pointer;
  vertical-align: middle;
}
.addAcc {
  cursor: pointer;
  color: green;
  font-size: 20px;
}
.delAcc {
  cursor: pointer;
  color: red;
  font-size: 20px;
}
.wh-250 {
  width: 250px;
}
.wh-150 {
  width: 140px !important;
}
.btn {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
}
.itemCode {
  display: flex;
  padding: 10px;
  .itemCode-content {
    display: flex;
    /deep/ .el-input {
      .el-input__inner {
        padding: 0;
      }
    }
  }
  .str {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20px;
    vertical-align: middle;
  }
  .select {
    margin-right: 10px;
  }
  .wh-60 {
    width: 60px;
  }
  .changeItemCode {
    margin-left: 10px;
  }
}
.wh-60per {
  width: 60%;
}
.amendDialog {
  /deep/ .el-dialog__header,
  .el-dialog__headerbtn {
    display: none;
  }
  .amend-close {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 20px;
    padding: 0 10px;
    .closeBtn {
      cursor: pointer;
      font-size: 18px;
    }
  }
}
.wh-120 {
  width: 120px !important;
}
.preview {
  /deep/ .el-dialog__headerbtn {
    display: none;
  }

  .previewHeight {
    min-height: 100px;
    max-height: 650px;
    overflow: auto;
    text-align: center;
    background: url("../../../assets/loading.gif") no-repeat center center;
  }

  .iframe {
    width: 100%;
    height: 640px;
  }

  .img {
    max-width: 900px;
    // max-height: 610px;
  }
}
.flex {
  display: flex;
  justify-content: end;
}
/deep/ #tab-add {
  .el-icon-close {
    display: none !important;
  }
}
.add-inventory {
  position: absolute;
  right: 20px;
  z-index: 999;
}
/deep/ .red {
  .el-input__inner {
    border: 1px solid red;
  }
}
.wh-173 {
  width: 173px;
}
.wh-200 {
  width: 190px !important;
}

// }
.el-icon-more {
  transform: rotate(-90deg);
  color: #aaa;
}
</style>
