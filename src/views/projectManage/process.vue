<template>
  <div class="app-container" v-loading="loading2">
    <!-- 头部搜索框 -->
    <div class="clearfix card-header search-mr">
      <div class="head">
        <el-form ref="form" label-width="80px">
          <el-form-item label="项目" label-width="40px" v-if="user.orgType == 2 || user.orgType == 3 || user.orgType == 9">
            <el-select v-model="searchData.fkProjectId" size="mini" @change="projectIdChange">
              <el-option label="全部" value=""></el-option>
              <el-option v-for="item in projectList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="标段项目" label-width="90px" v-if="user.orgType == 2 || user.orgType == 3 || user.orgType == 9 || user.orgType == 4">
            <el-select v-model="searchData.fkProjectBidId" size="mini">
              <el-option label="全部" value=""></el-option>
              <el-option v-for="item in noProjectData" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="流程名称">
            <el-input size="mini" v-model="searchData.processName"></el-input>
          </el-form-item> -->
          <el-form-item label="分项工程">
            <el-input size="mini" v-model="searchData.itemName" maxlength="100"></el-input>
          </el-form-item>
          <el-form-item label="发起人">
            <el-select v-model="searchData.sponsorId" size="mini">
              <el-option value="" label="全部"> </el-option>
              <el-option v-for="item in initiator" :key="item.pkId" :label="item.userName" :value="item.pkId"> </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="检查状态">
            <el-select v-model="searchData.approveStatus" size="mini">
              <el-option value="" label="全部"></el-option>
              <el-option :value="item.name" :label="item.key" v-for="item in statusList" :key="item.name"></el-option>
            </el-select>
          </el-form-item>
          <el-button size="mini" class="btn-serach el-button-primary" type="primary" icon="el-icon-search" @click="search">查询</el-button>
        </el-form>
        <el-button type="primary" size="mini" class="launch el-button-primary" @click="faqiLc" v-has="'production:process:add'">发起流程</el-button>
      </div>
    </div>
    <!-- 表ge -->
    <div class="table-data" style="height:80%">
      <el-table :tooltip-effect="'light'" ref="tables" v-loading="loading" :data="tableData" :row-class-name="tableRowClassName" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
        <el-table-column align="center" label="序号" type="index" width="60">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (pageNum - 1) * pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="项目" prop="fkProjectName" align="center" show-overflow-tooltip v-if="user.orgType === 2 || user.orgType === 3 || user.orgType === 9"> </el-table-column>
        <el-table-column label="标段项目" prop="fkBidProjectName" align="center" v-if="user.orgType !== 5" show-overflow-tooltip> </el-table-column>
        <!-- <el-table-column
        align="center"
        label="流程名称"
        prop="processName"
      ></el-table-column> -->
        <el-table-column align="center" label="分项工程" prop="itemNames" v-if="topRadio !== 2" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" label="发起人" prop="createUserName" v-if="topRadio !== 1" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" label="当前任务" prop="currentTaskName" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" label="当前办理人" prop="approver" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" label="开始时间" prop="createTime" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" label="流程状态" prop="approveStatusStr">
          <template slot-scope="{ row }">
            <div style="display:flex;align-items:center;justify-content: center;">
              <div>{{ row.approveStatusStr }}</div>
              <img src="../../assets/loader.gif" alt="" class="loaders" v-if="row.approveStatusStr == '数据处理中'" />
              <!-- <img src="../../assets/loader.gif" alt="" class="loaders" v-if="row.approveStatus == 10"> -->
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="320">
          <template slot-scope="{ row }">
            <!-- 文琪说发起用章审批不用按钮权限的 -->
            <el-button plain type="primary" size="mini" v-if="row.sealStatus == 1" @click="chapterClick(row)">发起用章审批</el-button>
            <el-button plain type="primary" size="mini" v-if="row.sealStatus == 2" @click="chapterClick(row)">重新发起用章审批</el-button>
            <el-button plain type="primary" size="mini" @click="lookOver(row, 1, 2)" v-has="'projectManage:process:query'">查看</el-button>
            <el-button plain type="danger" size="mini" @click="clearLog(row.pkId)" v-if="row.clearBtnStatus == 1">清除记录</el-button>

            <el-button plain size="mini" type="info" v-if="row.handleStatus == 1" @click="lookOver(row, 2, 3)">审批</el-button>
            <el-button plain type="warning" size="mini" @click="withdraw(row.pkId)" v-if="row.cancelStatus == 1">撤回</el-button>
            <el-button size="mini" plain type="primary" v-if="row.sealWithdrawStatus" @click="revocation(row)">撤回</el-button>
            <!-- <el-button plain size="mini" v-show="row.editStatus == '1'" v-if="row.approveStatus == 0 || row.approveStatus == 3 || row.approveStatus == 7" @click="lookOver(row, 1, 1)" v-has="'production:process:edit'" type="success">编辑</el-button>
            <el-button plain size="mini" type="danger" v-show="row.deleteStatus == '1'" v-if="row.approveStatus == 0 || row.approveStatus == 3 || row.approveStatus == 7" @click="handleDelete(row.pkId)" v-has="'production:process:delete'">删除</el-button> -->
            <el-button plain size="mini" type="info" v-if="row.sealApproveStatus == 1" @click="chapterApproveClick(row)">{{ row.sealPersonStatus ? "盖章" : "审批" }}</el-button>
          </template>
        </el-table-column>
        <div slot="empty" class="empty" style="width: 100%">
          <img src="@/assets/empty.svg" class="zanwu" />
          <span>暂无数据</span>
        </div>
      </el-table>
    </div>
    <!-- 分页组件 -->
    <Pagination class="pagination" :currentPage="pageNum" :pageSize="pageSize" :total="total" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange" />
    <!-- 发起流程弹窗 编辑-->
    <el-dialog :close-on-press-escape="false" :title="titles" width="70%" class="tree-dialog" top="5vh" :visible.sync="popup" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <!-- 第一步：选择分项工程 -->
      <div v-show="step == 1" class="box">
        <!-- 分项工程 -->
        <div class="title-item">
          <div class="larby">施工验收的分项工程:</div>
          <div @click="selectTree" class="item-details" :style="editNum != 1 ? 'cursor: pointer' : 'cursor: no-drop'">
            <span ref="itemName">{{ nodeDetels.itemName ? nodeDetels.itemName : "请选择分项工程" }}</span>
            <i class="el-icon-more"></i>
          </div>
          <!-- 树形工程 -->
          <div class="tree-project" v-show="treeStatus">
            <div class="head-selc">
              <el-input v-model="filterText" size="mini" clearable class="text-select">
                <i slot="prefix" class="el-input__icon el-icon-search"></i>
              </el-input>
              <el-button type="primary" class="el-button-primary" size="mini" round @click="treeConfirm">确认</el-button>
            </div>
            <div class="tree-list">
              <el-tree @node-expand="nodeExpand" class="filter-tree" :data="treeData" node-key="pkId" :props="defaultProps" default-expand-all :filter-node-method="filterNode" show-checkbox @check="checked" :check-strictly="true" ref="treeForm">
                <span slot-scope="{ node }">
                  <!-- <el-tooltip effect="dark" :content="node.label" placement="bottom-start" :disabled="node.label.length < 20"> -->
                  <span class="label">{{ node.label }}</span>
                  <!-- </el-tooltip> -->
                </span>
              </el-tree>
            </div>
          </div>
        </div>
        <!-- 選擇 提示 -->
        <h3 class="hint" v-if="treeId == ''">请选择分项工程</h3>
        <el-tabs v-model="activeName4" type="card" v-else>
          <el-tab-pane label="审批人" name="approver">
            <div class="approval-dialog">
              <div class="begin">开始</div>
              <div class="begin-icon">
                <i class="el-icon-bottom"></i>
              </div>
              <div class="approver-workflowName">{{ approvalData.workflowName }}</div>
              <div v-for="(item, index) in approvalData.workflowNodeDTOS" :key="index">
                <div v-if="item.nodeType == 3" class="acceptance-node">
                  <div class="node-name">{{ item.nodeName }}</div>
                  <div style="display: inline-block;" v-for="(items, indx) in item.baseSubWorkflow.workflowNodeDTOS" :key="indx">
                    <div class="child-node" v-if="items.nodeType == 2">
                      <div class="child-node-role">
                        <i class="el-icon-user-solid"></i>
                        {{ items.nodeName }}
                      </div>
                      <i class="el-icon-right arrows-right" v-if="indx != item.baseSubWorkflow.workflowNodeDTOS.length - 2"></i>
                      <div class="approval-select">
                        <el-select size="mini" :disabled="items.prodSysRoleVo.sysUserList.length == 0" clearable :class="{ 'background-red': items.prodSysRoleVo.sysUserList.length == 0 }" v-model="items.prodSysRoleVo.selectedUserId" @change="selectedUserIdChange">
                          <el-option v-for="(e, idx) in items.prodSysRoleVo.sysUserList" :key="idx" :label="e.userName" :value="e.pkId"> </el-option>
                          <el-option v-if="items.prodSysRoleVo.sysUserList.length == 0" label="未找到匹配人员" value=""></el-option>
                        </el-select>
                      </div>
                    </div>
                  </div>
                  <i class="el-icon-bottom arrows-bottom" style=""></i>
                </div>
              </div>
              <div class="finish">
                <div class="finish-text">结束</div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="关联资料" name="third" v-if="nodeDetels.engWorkflowNodePdfVos && nodeDetels.engWorkflowNodePdfVos.length">
            <div class="table1 table-data">
              <el-table :tooltip-effect="'light'" ref="tables" v-loading="loading" :data="nodeDetels.engWorkflowNodePdfVos" :row-class-name="tableRowClassName" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
                <el-table-column align="center" label="序号" type="index" width="60">
                  <template slot-scope="scope">
                    <div style="text-align: center">
                      {{ (pageNum - 1) * pageSize + (scope.$index + 1) }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="流程节点" prop="nodeName" show-overflow-tooltip></el-table-column>
                <el-table-column align="center" label="资料类型" prop="bookType">
                  <template slot-scope="{ row }">
                    <div style="text-align: center" v-if="row.bookType == 0">技术规范</div>
                    <div style="text-align: center" v-if="row.bookType == 1">安全规范</div>
                    <div style="text-align: center" v-if="row.bookType == 2">验收标准</div>
                  </template>
                </el-table-column>
                <el-table-column align="center" label="资料名称" prop="bookName"></el-table-column>
                <el-table-column align="center" label="资料内容" prop="approver" show-overflow-tooltip>
                  <template slot-scope="{ row }">
                    <span v-if="row.beginPage == row.endPage">资料第{{ row.beginPage }}页</span>
                    <span v-else>资料第{{ row.beginPage }}~{{ row.endPage }}页</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="320">
                  <template slot-scope="{ row }">
                    <el-button plain type="primary" size="mini" @click="lookPdf(row)">查看</el-button>
                  </template>
                </el-table-column>
                <div slot="empty" class="empty" style="width: 100%">
                  <img src="@/assets/empty.svg" class="zanwu" />
                  <span>暂无数据</span>
                </div>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="dialog-form" v-show="step == 2">
        <div>
          <div class="project-list">
            <div class="list-item" style="display: flex; width: 100%">
              <div class="larby">流程名称</div>
              <el-input v-model="newProcessname" size="mini" clearable class="new-process" disabled> </el-input>
            </div>
          </div>
          <div class="project-list">
            <!-- 所属单位 -->
            <div class="list-item">
              <div class="larby">单位工程:</div>
              <el-tooltip effect="dark" :content="nodeDetels.oneParentName" placement="bottom-start" :disabled="isShowTooltip" class="item-detels">
                <div @mouseenter="onMouseEnter(`oneParentName`)">
                  <span ref="oneParentName">
                    {{ nodeDetels.oneParentName }}
                  </span>
                </div>
              </el-tooltip>
            </div>
            <!-- 所属单位 -->
            <div class="list-item">
              <div class="larby">分部工程:</div>
              <el-tooltip effect="dark" :content="nodeDetels.secondParentName" placement="bottom-start" :disabled="isShowTooltip" class="item-detels">
                <div @mouseenter="onMouseEnter(`secondParentName`)">
                  <span ref="secondParentName">
                    {{ nodeDetels.secondParentName }}
                  </span>
                </div>
              </el-tooltip>
            </div>
            <!-- 分项工程 -->
            <div class="list-item">
              <div class="larby">分项工程:</div>
              <el-tooltip effect="dark" :content="nodeDetels.itemName" placement="bottom-start" :disabled="isShowTooltip" class="item-detels hit">
                <div @mouseenter="onMouseEnter(`itemName`)">
                  <span ref="itemName">{{ nodeDetels.itemName }}</span>
                </div>
              </el-tooltip>
            </div>
            <!-- <div class="list-item">
                <div class="larby">下一节点</div>
                <el-tooltip effect="dark" :content="nodeDetels.baseSysRole ? nodeDetels.baseSysRole.roleName : ''" placement="bottom-start" :disabled="isShowTooltip" class="item-detels">
                  <div @mouseenter="onMouseEnter(`roleName`)">
                    <span ref="roleName">{{ nodeDetels.baseSysRole ? nodeDetels.baseSysRole.roleName : "" }}</span>
                  </div>
                </el-tooltip>
              </div>
              <div class="list-item">
                <div class="larby">负责人</div>
                <div class="item-detels">
                  <el-select v-model="prinId" placeholder="请选择" value-key="pkId" size="mini" @change="personCharge">
                    <el-option v-for="item in principal" :key="item.pkId" :label="item.userName" :value="item"> </el-option>
                  </el-select>
                </div>
              </div> -->
          </div>
          <!-- 这个动态显示，只有隧道和路基显示 itemType 2 1-->
          <div class="project-list" v-if="itemType > 0">
            <div class="list-item">
              <div class="larby" v-if="itemType == 2">剩余进尺:</div>
              <div class="larby" v-else>{{ this.finishPec.indexOf("第1次") !== -1 ? "剩余最大填高:" : "剩余填高:" }}</div>
              <div class="item-detels">
                <el-input v-model="footage" :disabled="footType" type="number" size="mini" class="wh-140" @input="feedin($event, 1)" @keydown.native="keyDown" v-if="editNum != 1">
                  <template slot="append">米</template>
                </el-input>
                <el-input v-model="footage" :disabled="footType" type="number" size="mini" class="wh-140" @input="feedin($event, 1)" @keydown.native="keyDown" v-else>
                  <template slot="append">米</template>
                </el-input>
              </div>
            </div>
            <div class="list-item" v-if="itemType === 1">
              <div class="larby">本次填高:</div>
              <div class="item-detels">
                <el-input v-model="footage3" size="mini" type="number" @input="feedin($event, 2)" class="wh-140" @keydown.native="keyDown">
                  <template slot="append">米</template>
                </el-input>
              </div>
            </div>
            <!-- 施工进尺 -->
            <div class="list-item">
              <div class="larby" v-if="itemType == 2">本次施工进尺:</div>
              <div class="larby" v-else>施工后剩余填高</div>
              <div class="item-detels">
                <el-input v-model="footage2" size="mini" type="number" :precision="2" @input="feedin($event, 2)" @keydown.native="keyDown" class="wh-140" :disabled="itemType === 1">
                  <template slot="append">米</template>
                </el-input>
              </div>
            </div>
            <div class="list-item" v-if="itemType === 2">
              <div class="larby">施工后剩余进尺:</div>
              <div class="item-detels">
                <el-input :value="footage - footage2" size="mini" type="number" @input="feedin" class="wh-140" disabled>
                  <template slot="append">米</template>
                </el-input>
              </div>
            </div>
            <div class="list-item" style="flex:1.55;">
              <div class="larby">本次完成分项工程:</div>
              <el-tooltip effect="dark" :content="finishPec" placement="bottom-start" :disabled="isShowTooltip" class="item-detels2">
                <div @mouseenter="onMouseEnter(`finishPec`)">
                  <span ref="finishPec">{{ finishPec }}</span>
                </div>
              </el-tooltip>
            </div>
          </div>
          <!-- 流程图 -->
          <!-- <div class="flow-chart">
            <div class="process-name">{{ proceName }}</div>
            <div class="canvas" ref="canvas" id="canvas"></div>
          </div> -->
        </div>
        <el-tabs v-model="activeName2" type="card">
          <!-- 关联表格 -->
          <el-tab-pane :label="item.tableName" :name="`first${index}`" v-for="(item, index) in workflowTableList" :key="item.fkTableId">
            <div class="tab-box table1 table-data" @scroll="handleScroll">
              <div class="text-html">
                <table style="border-collapse: collapse;overflow: auto;margin: 0 auto;" ref="printPage">
                  <tr v-for="(item, idx) in item.tableHtml" :key="idx" v-show="item.status">
                    <td style="box-sizing: content-box;border:none;margin:0;padding:0" :contentEditable="i.attributeTypes == 1 && i.disabled == true && i.checkout == false && workflowTableList[index].editFlag == 1" @blur="tdBlur(item, id, $event.target.innerText, $event, i)" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
                      <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
                      <el-input v-if="i.attributeTypes == 1 && i.checkout == 1" :disabled="i.id != '' && i.name != ''" @input="tdNameChange(item, id, i.name)" @blur="tdNameBlur(item, id, i.name)" v-model="i.name" size="mini"></el-input>
                      <span v-if="i.attributeTypes == 3"
                        >{{ i.signatureDate.content }}:
                        <el-avatar shape="square" style="width: 30px;height: 20px;" v-if="i.signatureDate.url" :src="i.signatureDate.url"></el-avatar>
                      </span>
                      <el-select ref="scroll" v-if="i.attributeTypes == 2" size="mini" v-model="i.name" placeholder="请选择">
                        <el-option v-for="(e, index) in i.option" :key="index" :label="e.label" :value="e.label"></el-option>
                      </el-select>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="附件" name="second">
            <div class="table1 table-data">
              <!-- 用单独一个table使用v-if隐藏某些行会导致样式错乱，所以使用2个table -->
              <el-table :tooltip-effect="'light'" :data="accessoryList" height="100%" style="width: 100%" stripe :header-cell-style="{ background: '#f1f6ff' }">
                <el-table-column label="序号" type="index" width="80" align="center"> </el-table-column>
                <el-table-column label="附件内容描述" align="center" prop="remark">
                  <template slot-scope="{ row }">
                    <el-input v-model="row.remark" size="mini" maxlength="100"></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="附件" align="center" width="180">
                  <template slot-scope="{ row }">
                    <el-button type="primary" class="el-button-primary" size="mini" v-if="!row.fileName" @click="uploadAcc(row)">上传附件 </el-button>
                    <a href="#" @click="preview(row)" v-else>{{ row.fileName }}</a>
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="100">
                  <template slot-scope="{ row, $index }">
                    <span class="addAcc" v-if="accessoryList.length == $index + 1" @click="addAcc(row)" title="新增">
                      <i class="el-icon-plus"></i>
                    </span>
                    <span class="delAcc" @click="delAcc(row)" title="删除">
                      <i class="el-icon-close"></i>
                    </span>
                    <!-- <el-button
                            size="mini"
                            type="primary"
                            class="downloadAcc"
                            v-if="dialogType > 3"
                            @click="downloadAcc(row)"
                          >
                            下载
                          </el-button> -->
                  </template>
                </el-table-column>
                <div slot="empty" class="empty" style="width: 100%">
                  <img src="@/assets/empty.svg" class="zanwu" />
                  <span>暂无数据</span>
                </div>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer" v-show="step == 1">
        <el-button type="danger" @click="nextStep" style="background:#b8741a ">下一步></el-button>
        <el-button type="primary" plain @click="popup = false">&nbsp;&nbsp;&nbsp; 取 消 &nbsp;&nbsp;&nbsp;</el-button>
      </span>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer" v-show="step == 2">
        <el-button type="danger" style="background:#b8741a " @click="lastStep">上一步</el-button>
        <el-button type="primary" class="el-button-primary" @click="launchFlow(1)">发起流程</el-button>
        <el-button type="primary" class="el-button-primary" @click="launchFlow(0)">保存草稿</el-button>
        <el-button type="primary" plain @click="popup = false">&nbsp;&nbsp;&nbsp; 取 消 &nbsp;&nbsp;&nbsp;</el-button>
      </span>
      <!-- 隐藏的input file,用于上传附件 -->
      <input ref="upload" type="file" style="display:none" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.docx,image/jpg,image/jpeg,image/png,application/pdf" @change="upLoad" />
    </el-dialog>
    <!-- 预览pdf弹框 -->
    <pdfPiev ref="pdfPiev" :urlr="url" :number="number" />
    <!-- 查看图片，work，excel文档使用的弹框 -->
    <el-dialog :close-on-press-escape="false" title="" :visible.sync="previewDialog" class="preview">
      <div class="previewHeight dialog-form" ref="previewHeight">
        <iframe ref="iframe" class="iframe" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + nowPreviewObj.fileUrl" v-if="previewType == 1"></iframe>
        <img class="img" :src="nowPreviewObj.fileUrl" alt="" v-if="previewType == 3" />
      </div>
    </el-dialog>
    <!-- 节点信息模态框 -->
    <NodeDialog @handleApprove="DelayMethod" :nodeDialog.sync="disposeDialog" :show="true" :data="disposeData" :roleDtoName="roleDtoName" :principal="disposeMan" :parentId="pkIdItem" @cableck="cableck" @cleanData="cleanData" />
    <chapterProcess @init="getData" :chapterDialog.sync="chapterDialog" :bizType="0" :bizId="bizId"></chapterProcess>
    <chapterProcessApproval @init="getData" :chaptersApprovalDialog.sync="chaptersApprovalDialog" :bizType="0" :sealPersonStatus="sealPersonStatus" :bizId="bizId"></chapterProcessApproval>
    <!-- 打印导出的表格 -->
    <div style="position: absolute;left: -9999999px;">
      <table style="border-collapse: collapse;overflow: auto;margin: 0 auto;" ref="pdfTable" v-for="(items, index) in pdfTable" :key="index" :id="'pdfDom' + index">
        <tr v-for="(item, idx) in items" :key="idx" style="" v-show="item.status">
          <td style="box-sizing: content-box;border:none;margin:0;padding:0" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
            <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
            <span v-if="i.attributeTypes == 1 && i.checkout == 1">{{ i.name }}</span>
            <span v-if="i.attributeTypes == 3">{{ i.signatureDate.content }}:</span>
            <span v-if="i.attributeTypes == 2">{{ i.name }}</span>
          </td>
        </tr>
      </table>
    </div>
    <!-- 施工验收流程查看详情 -->
    <proCheckDialog :data="disposeData" :proChangeDialog.sync="proChangeDialog" :appDiaType="appDiaType" @getList="getData" />
    <!-- <approvalDialog :appDiaType="4" @approvalDialogClose="approvalDialogClose" :approvalDialog.sync="approvalDialog" :showData="disposeData" approvalTitle="分项工程审批流程详情"  ></approvalDialog> -->
  </div>
</template>

<script>
import Pagination from "@/components/tablePaging";
import NodeDialog from "@/components/NodeDialog/NodeDialog"; // 审批弹框
import { CustomViewer } from "@/components/customBpmn";
import basicViwr from "@/components/basicViwr";
import pdfPiev from "../../components/pdf-preview/pdf-preview.vue";
import COS from "cos-js-sdk-v5";
import utils from "@/utils/util";
import htmlToPdf from "@/utils/htmlToPdf";
import chapterProcess from "../../components/inChapter/chapterProcess.vue";
import chapterProcessApproval from "../../components/inChapter/chapterProcessApproval.vue";
import proCheckDialog from "../home/compoments/proCheckDialog.vue"; // 查看详情
import { uploadObject } from "@/utils/upload";
// import approvalDialog from "./components/approvalDialog.vue"
export default {
  components: { Pagination, NodeDialog, basicViwr, pdfPiev, chapterProcess, chapterProcessApproval, proCheckDialog },
  data() {
    return {
      // 树形数据
      dataList: [],
      defaultProps: {
        children: "prodItemLists",
        label: "itemName"
      },
      treeData: [],
      // 主表格数据
      tableData: [],
      // 项目部下拉框
      options: [],
      // 负责人
      principal: [],
      // 搜索条件
      searchData: {
        fkProjectId: "",
        fkProjectBidId: "",
        itemName: "",
        sponsorId: "",
        approveStatus: ""
      },
      projectList: [],
      noProjectData: [], // 标段项目
      // 发起来下拉
      initiator: [],
      popup: false, // 发起流程弹窗
      // 模态框里当前tab
      activeName: "basicInform",
      activeName4: "approver",
      // 基本信息
      basicInfo: {},
      // 审批记录表
      ApprovalList: [],
      // 关联资料表
      linkList: [],
      // 关联表格左侧
      linkTableLift: [],
      // 施工评定表
      conEvaList: [],
      // 工程量
      workAmount: [],
      // 材料用量
      materials: [],
      topRadio: 3,
      // 模拟权限，1为正常登陆，2为项目部登陆
      quanxian: 1,
      tableRadio: 1,
      // 处理弹窗绑定状态
      disposeDialog: false,
      disabled: false, // 剩余米数输入框禁用
      prinId: {}, // 负责人选择后的data
      prinIdName: "",
      footage: "", // 剩余jinci
      footType: false,
      footage2: "", // 施工进尺
      footage3: "", // 完成量
      finishPec: "", // 完成分项工程名称
      treeStatus: false,
      filterText: "",
      treeId: "", // 节点选择完的pkid 确认分项工程ID
      pageNum: 1,
      pageSize: 10,
      total: 0,
      selectedId: "", //  点击选中tree节点的id 211 311
      specialType: "",
      treeNode: [], // 选中的节点
      nodeDetels: {}, // 节点返回的信息
      proceName: "", // 流程名称
      bpmnImg: "", // 流程xml
      stair1: "",
      stair2: "",
      itemType: 0, // 0普通，1路基，2隧道
      timer: "",
      newProcessname: "", // 新增的流程名称
      haschecked: [], // 确定后的选择tree数组集合，解决回显问题
      bpmnModeler: null,
      editNum: "", // 用来判断新增还是保存
      pkIdItem: "", // 当前点击列表ID
      itemData: {}, // 列表每一项的数据
      tabTitle: "", // 关联表格里面的数据
      tabContent: "",
      tabData: {}, // 新增的表格数据
      disposeData: {},
      disposeMan: [], // 处理里面的负责人
      prinIdName2: "", // 负责人的名称
      roleDtoName: "", // 根据这个参数判断下一节点审批人显示隐藏
      loading: true,
      nodeArr: [], // 选中多个才需要传的
      svgHtml: "",
      lookType: "",
      isShowTooltip: "",
      loading2: false,
      projectArr: [],
      orgid_type: "", // 当前登录是什么类型角色，施工单位用
      url: "",
      number: 1,
      activeName2: "first0",
      // 附件列表
      accessoryList: [{ id: 1, fileName: "", remark: "", fileUrl: "" }],
      // 当前点击表单上传的数据
      nowUploadObj: {},
      // 当前预览的表单obj
      nowPreviewObj: {},
      // 预览弹框的状态
      previewDialog: false,
      // 查看附件的状态：1为work和excel，2为pdf，3为图片
      previewType: 0,
      // 附件文件类型
      fileType: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "image/jpg", "image/jpeg", "image/png", "application/pdf"],
      chapterDialog: false,
      bizId: "",
      reportUrl: "",
      pdfTable: [],
      pdfTitle: [],
      pdfUrl: [],
      rowIndex: 0,
      approvalShow: false,
      approvalData: {
        workflowNodeDTOS: []
      },
      approvalStatus: false,
      chaptersApprovalDialog: false,
      titles: "第一步：选择分项工程",
      statusList: [],
      engWorkflowNodeTableVos: [], // 新增时动态表
      user2: {}, // 新增表格用到
      step: 1, // 1新增编辑第一步，2第二步
      workflowTableList: [], // 新增时使用的表格
      currentPrecessId: "", // 工序ID 获取表格workflowTableList
      currentPrecessId2: "", // 获取到的工序ID进行对比
      proChangeDialog: false,
      disposeData: {},
      modifiedList: [],
      approvalDialog: false,
      appDiaType: 1,
      timess: null,
      sealPersonStatus: 0
    };
  },
  watch: {
    filterText(val) {
      this.$refs.treeForm.filter(val);
    },

    popup(newVal) {
      if (newVal == false) {
        this.nodeDetels = {};
        this.treeNode = [];
        this.treeId = "";
        this.step = 1;
        // this.prinIdName = "";
        this.prinId = {};
        // this.prinId.pkId = "";
        this.principal = [];
        this.footage2 = "";
        this.footage = "";
        this.footage3 = "";
        this.finishPec = "";
        this.itemType = 0;
        this.bpmnImg = "";
        this.proceName = "";
        this.newProcessname = "";
        // document.getElementById("canvas").innerHTML = ""; // 新增按钮处理流程图多显示问题
        this.treeStatus = false;
        this.haschecked = [];
        this.selectedId = ""; // 清空tree选中状态
        this.$refs.treeForm.setCheckedNodes([]);
        this.editNum = ""; // 解决编辑新增问题
        this.nodeArr = [];
        this.accessoryList = [{ id: 1, fileName: "", remark: "", fileUrl: "" }];
        this.activeName2 = "first";
        this.workflowTableList = [];
        this.currentPrecessId2 = "";
        this.pkIdItem = "";
      }
    },
    pdfShow(val) {
      if (!val) {
        this.url = "";
      }
    },
    previewDialog(val) {
      if (!val) {
        this.nowPreviewObj = {};
      }
    },
    disposeDialog(val) {
      if (val == false) {
        this.proceName = "";
        this.newProcessname = "";
      }
    }
  },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  mounted() {
    this.search();
    // 处理搜索条件问题 239  4  5  请求对应数据
    if (this.user.orgType == 2 || this.user.orgType == 3 || this.user.orgType == 9) {
      this.noProject();
    }
    if (this.user.orgType == 4) {
      // 获取所有的标段项目
      this.projectData();
    }

    this.getData();
    this.initiatorData();
    this.searchProcessApproveStates();
    // 表格需要用到
    this.user2 = JSON.parse(sessionStorage.getItem("user"));
  },
  methods: {
    pageTime(boo) {
      clearInterval(this.timess);
      if (boo) {
        this.timess = setInterval(() => {
          if (this.tableData.filter(item => item.approveStatusStr == "数据处理中").length) {
            this.getData();
          } else {
            clearInterval(this.timess);
          }
        }, 3000);
      }
    },
    DelayMethod() {
      setTimeout(() => {
        console.log("888 -----> ", 888);
        this.search();
      }, 10000);
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
    // 获取项目下拉列表
    noProject() {
      this.$api.getItemListNoUserId().then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.projectName;
            item.value = item.pkId;
          });
          this.projectList = res.data;
        }
      });
    },
    // 根据项目id获取标段项目下拉列表
    projectIdChange(val) {
      const data = {};
      if (val.length == 0) {
        this.searchData.fkProjectBidId = ""; // 清空标段项目
        this.noProjectData = [];
        return;
      } else {
        data.isWhole = 0;
        data.projectId = val;
      }
      this.$api.noProject(data).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.fkBidProjectName;
            item.value = item.fkBidProjectId;
          });
          this.noProjectData = res.data;
        }
      });
    },
    // 施工单位获取标段项目
    projectData() {
      this.$api.noProject({ isWhole: 1, projectId: "" }).then(res => {
        if (res.code == 200) {
          res.data.forEach(item => {
            item.label = item.fkBidProjectName;
            item.value = item.fkBidProjectId;
          });
          this.noProjectData = res.data;
        }
      });
    },
    // approvalDialogClose(){
    //   this.approvalDialog = false
    // },
    // 新增编辑下一步
    nextStep() {
      if (this.treeId == "") {
        return this.$message.warning("请先选择施工验收的分项工程");
      }
      let materialUsedTable = false; // 判断节点是否有材料用量
      let quantitiesTable = false; // 判断节点是否有工程量
      this.approvalData.workflowNodeDTOS.forEach(item => {
        if (item.nodeType == 3) {
          item.baseSubWorkflow.workflowNodeDTOS.forEach(element => {
            if (element.nodeType == 2 && element.prodSysRoleVo.selectedUserId != "" && element.materialUsedTable == 1) {
              console.log(element);
              return (materialUsedTable = true);
            }
          });
        }
      });
      // 获取工序ID
      this.currentPrecessId = "";
      const arr = this.approvalData.workflowNodeDTOS; // 这是审批人
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].nodeType == 3) {
          for (let j = 0; j < arr[i].baseSubWorkflow.workflowNodeDTOS.length; j++) {
            // 判断是否选了人
            if (arr[i].baseSubWorkflow.workflowNodeDTOS[j].nodeType == 2 && arr[i].baseSubWorkflow.workflowNodeDTOS[j].prodSysRoleVo.selectedUserId != "") {
              this.currentPrecessId = arr[i].baseSubWorkflow.workflowNodeDTOS[j].prodSysRoleVo.currentPrecessId;
              break;
            } else {
              this.currentPrecessId = "";
            }
          }
          if (this.currentPrecessId != "") {
            break;
          }
        }
      }
      // 根据获取到工序ID判断是否设置了审批人
      if (this.currentPrecessId == "") {
        return this.$message.warning("请选择节点审批人员");
      }
      if (!materialUsedTable) {
        console.log("materialUsedTable:", materialUsedTable);
        return this.$message.warning("工程量/材料用量节点审批人不能跳过");
      }
      this.approvalData.workflowNodeDTOS.forEach(item => {
        if (item.nodeType == 3) {
          item.baseSubWorkflow.workflowNodeDTOS.forEach(element => {
            if (element.nodeType == 2 && element.prodSysRoleVo.selectedUserId != "" && element.quantitiesTable == 1) {
              return (quantitiesTable = true);
            }
          });
        }
      });
      if (!quantitiesTable) {
        console.log("quantitiesTable:", quantitiesTable);
        return this.$message.warning("请先设置节点工程量!");
      }

      // 编辑的时候控制不去调接口污染表格原始数据
      if (this.editNum == 1 && this.currentPrecessId == this.currentPrecessId2) {
        this.step = 2;
        return;
      }
      this.titles = "第二步：填写信息";
      this.getWorkflowTables();
    },
    lastStep() {
      this.step = 1;
      this.titles = "第一步：选择分项工程";
    },
    // 根据工程id和工序id获取表格
    getWorkflowTables() {
      this.loading = true;
      this.$api.getWorkflowTables({ itemIdList: this.treeId }).then(res => {
        if (res.code === 200) {
          // 处理表格
          const arr1 = JSON.stringify(res.data);
          this.modifiedList = JSON.parse(arr1);

          this.modifiedList.forEach(item => {
            item.tableHtml = utils.unzip(item.tableHtml);
          });
          this.workflowTableList = res.data;
          this.workflowTableList.forEach(item => {
            item.tableHtml = utils.unzip(item.tableHtml);
            if (item.tableHtml instanceof Array) {
            } else {
              item.tableHtml = JSON.parse(item.tableHtml);
            }
          });
          // tab展示
          if (this.workflowTableList && this.workflowTableList.length) {
            this.activeName2 = "first0";
          } else {
            this.activeName2 = "second";
          }
          this.step = 2;
        } else {
          this.$message.warning(res.msg);
        }
        this.loading = false;
      });
    },
    searchProcessApproveStates() {
      this.$api.searchProcessApproveStates().then(res => {
        if (res.code === 200) {
          this.statusList = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    revocation(row) {
      this.loading2 = true;
      this.$api
        .findProcessApproveById({ approveId: row.pkId, type: 2 })
        .then(res => {
          this.loading2 = false;
          if (res.code == 200) {
            this.disposeData = res.data;
            this.appDiaType = 6;
            this.proChangeDialog = true;
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading2 = false;
        });
      // this.$confirm("确定撤回该用章审批流程?", "提示", {
      //   confirmButtonText: "确定",
      //   cancelButtonText: "取消",
      //   type: "warning"
      // }).then(() => {
      //   const pkId = row.pkId;
      //   this.$api.revocationWithdrawSeal({ pkId }).then(res => {
      //     if (res.code == 200) {
      //       this.$message.success("撤回成功");
      //       this.getData();
      //     } else {
      //       this.$message.warning(res.msg);
      //     }
      //   });
      // });
    },
    selectedUserIdChange(e) {
      this.approvalStatus = true;
    },
    // 获取审批人
    approverSetting() {
      if (this.haschecked.length == 0) {
        return this.$message.warning("分项，流程模板不存在");
      }
      const data = {
        itemIdStrList: this.haschecked.join(", ")
      };
      if (this.editNum == 1) {
        data.pkId = this.pkIdItem;
      }
      this.$api.getWorkflowDetail(data).then(res => {
        if (res.code == 200) {
          res.data.workflowNodeDTOS.forEach(item => {
            if (item.nodeType == 3) {
              item.baseSubWorkflow.workflowNodeDTOS.forEach(items => {
                if (items.nodeType == 2) {
                  items.prodSysRoleVo.selectedUserId = items.prodSysRoleVo.selectedUserId == null ? "" : items.prodSysRoleVo.selectedUserId;
                }
              });
            }
          });
          this.approvalData = res.data; // 获取审批人
          // this.approvalShow = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    dataExport() {
      this.loading = true;
      this.pdfUrl = [];
      if (this.pdfTable.length == 0) {
        const data = {
          engTableExportList: this.pdfUrl,
          pkId: this.pkIdItem
        };
        this.prodProcessApproveExport(data);
      } else {
        this.pdfTable.forEach((item, idx) => {
          htmlToPdf
            .getPdf("#pdfDom" + idx, this.pdfTitle[idx].title, false, this.pdfTitle[idx].title.type) // download：false为不下载，这里调用了刚刚引用的全局函数，.then得到的值是base64位的pdf文件
            .then(res => {
              const _this = this;
              const files = uploadObject(utils.dataURLtoFile(res, this.pdfTitle[idx].title), url => {
                _this.urlPush(url, 0);
              });
            });
          if (idx + 1 == this.pdfTable.length) {
          }
        });
      }
    },
    urlPush(url, type) {
      const width = this.pdfTitle[this.pdfUrl.length].type == "2" ? 842 : 596;
      const height = this.pdfTitle[this.pdfUrl.length].type == "2" ? 596 : 842;
      this.pdfUrl.push({ path: url, width, height, name: this.pdfTitle[this.pdfUrl.length].title, direction: this.pdfTitle[this.pdfUrl.length].type });
      if (this.pdfUrl.length == this.pdfTable.length) {
        const data = {
          engTableExportList: this.pdfUrl,
          pkId: this.pkIdItem
        };
        if (type === 0) {
          this.prodProcessApproveExport(data);
        } else {
          this.prodProcessPrintPDF(data);
        }
      }
    },
    prodProcessApproveExport(data) {
      this.$api
        .prodProcessApproveExport(data)
        .then(res => {
          if (res.code == 200) {
            this.loading = false;
            utils.downFile(res.data.url, res.data.fileName);
            if (data.engTableExportList.length != 0) {
              const arr = [];
              data.engTableExportList.forEach(item => {
                arr.push(item.path);
              });
              const urls = arr.join(",");
              this.$api.delFiles({ urls });
            }
          } else {
            this.loading = false;
            if (data.engTableExportList.length != 0) {
              const arr1 = [];
              data.engTableExportList.forEach(item => {
                arr1.push(item.path);
              });
              const urls = arr1.join(",");
              this.$api.delFiles({ urls });
            }
            this.$message.warning(res.msg);
          }
        })
        .catch(error => {
          this.loading = false;
          if (data.engTableExportList.length != 0) {
            const arr1 = [];
            params.tableDTOS.forEach(item => {
              arr1.push(item.path);
            });
            const urls = arr1.join(",");
            this.$api.delFiles({ urls });
          }
          this.$message.warning(error);
        });
    },
    dataPrinting() {
      this.loading = true;
      this.pdfUrl = [];
      if (this.pdfTable.length == 0) {
        const data = {
          engTableExportList: this.pdfUrl,
          pkId: this.pkIdItem
        };
        this.prodProcessPrintPDF(data);
      } else {
        this.pdfTable.forEach((item, idx) => {
          htmlToPdf
            .getPdf("#pdfDom" + idx, this.pdfTitle[idx].title, false) // download：false为不下载，这里调用了刚刚引用的全局函数，.then得到的值是base64位的pdf文件
            .then(res => {
              const _this = this;
              const files = uploadObject(utils.dataURLtoFile(res, this.pdfTitle[idx].title), url => {
                _this.urlPush(url, 1);
              });
            });
          if (idx + 1 == this.pdfTable.length) {
          }
        });
      }
    },
    prodProcessPrintPDF(data) {
      this.$api
        .prodProcessPrintPDF(data)
        .then(res => {
          if (res.code == 200) {
            // window.open(res.data.url);
            printJS({ printable: res.data.url, type: "pdf" });
            this.loading = false;
            if (data.engTableExportList.length != 0) {
              const arr = [];
              data.engTableExportList.forEach(item => {
                arr.push(item.path);
              });
              const urls = arr.join(",");
              this.$api.delFiles({ urls });
            }
            // 使用 window.open 为了安全可加下面这行
            // otherWindow.opener = null;
          } else {
            this.loading = false;
            this.$message.warning(res.msg);
            if (data.engTableExportList.length != 0) {
              const arr = [];
              data.engTableExportList.forEach(item => {
                arr.push(item.path);
              });
              const urls = arr.join(",");
              this.$api.delFiles({ urls });
            }
          }
        })
        .catch(error => {
          this.loading = false;
          this.$message.warning(error);
          if (data.engTableExportList.length != 0) {
            const arr = [];
            data.engTableExportList.forEach(item => {
              arr.push(item.path);
            });
            const urls = arr.join(",");
            this.$api.delFiles({ urls });
          }
        });
    },
    chapterClick(row) {
      this.bizId = row.pkId;
      this.chapterDialog = true;
    },
    chapterApproveClick(row) {
      this.sealPersonStatus = row.sealPersonStatus;
      this.bizId = row.sealPkId;
      this.chaptersApprovalDialog = true;
    },
    nameBlur(idx, id, val) {
      // 手机号
      if (this.tabContent[idx].arr[id].checkType == 5) {
        const mobile = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
        if (val.length != 0) {
          if (!mobile.test(val)) {
            this.$message.warning("请输入正确的手机号");
            this.tabContent[idx].arr[id].name = "";
          }
        }
      }

      // 日期
      if (this.tabContent[idx].arr[id].checkType == 4) {
        const data = /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/;
        if (val.length != 0) {
          if (data.test(val)) {
          } else {
            this.tabContent[idx].arr[id].name = "";
            return this.$message.warning("请输入正确的时间格式xxxx-xx-xx");
          }
        }
      }
      // 身份证
      if (this.tabContent[idx].arr[id].checkType == 6) {
        const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
        // 15位身份证号码校验正则
        const regs = /^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$/;
        if (val.length != 0) {
          if (reg.test(val) || regs.test(val)) {
          } else {
            this.tabContent[idx].arr[id].name = "";
            return this.$message.warning("请输入正确的身份证号码");
          }
        }
      }
    },
    nameChange(idx, id, val) {
      //  纯数字
      if (this.tabContent[idx].arr[id].checkType == 1) {
        val = val.replace(/[^0-9]/g, "");
        this.tabContent[idx].arr[id].name = val;
      }
      // 小数
      if (this.tabContent[idx].arr[id].checkType == 2) {
        val = val.replace(/[^\d.]/g, "");
        this.tabContent[idx].arr[id].name = val;
      }
      // 金额
      if (this.tabContent[idx].arr[id].checkType == 3) {
        val = val.replace(/[^\d.]/g, ""); // 清除“数字”和“.”以外的字符
        val = val.replace(/\.{2,}/g, "."); // 只保留第一个. 清除多余的
        val = val.replace(".", "$#$");
        val = val.replace(/\./g, "");
        val = val.replace("$#$", ".");
        val = val.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3"); // 只能输入两个小数
        this.tabContent[idx].arr[id].name = val;
      }
      // // 日期
      if (this.tabContent[idx].arr[id].checkType == 4) {
        val = val.replace(/[^0-9-]/g, "");
        this.tabContent[idx].arr[id].name = val;
      }
      // 电话号码
      if (this.tabContent[idx].arr[id].checkType == 5) {
        val = val.replace(/[^0-9]/g, "");
        val = val.slice(0, 11);
        if (val.length >= 11) {
          const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
          if (!reg.test(val)) {
            this.$message.warning("请输入正确的手机号");
            this.tabContent[idx].arr[id].name = "";
          } else {
            this.tabContent[idx].arr[id].name = val;
          }
        }
      }
      // 身份证
      if (this.tabContent[idx].arr[id].checkType == 6) {
        val = val.replace(/[\u4e00-\u9fa5/\s+/]|[^a-zA-Z0-9\u4E00-\u9FA5]/g, "");
        this.tabContent[idx].arr[id].name = val;
      }
    },
    getData() {
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize
      };
      this.loading = true;
      this.$api
        .projectProcessCheckSearchPage({ ...params, ...this.searchData })
        .then(res => {
          if (res.code === 200) {
            this.tableData = res.data.records;
            this.pageTime(true);
            this.total = res.data.total - 0;
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => (this.loading = false));
    },

    faqiLc() {
      this.titles = "第一步：选择分项工程";
      this.launchProcess(); // 获取树形
      this.accessoryList = [{ id: 1, fileName: "", remark: "", fileUrl: "" }];
      this.popup = true;
      this.approvalStatus = false;
      this.editNum = "";
    },
    // 获取获取流程发起人列表
    initiatorData() {
      this.$api
        .findByProOrg()
        .then(res => {
          if (res.code === 200) {
            this.initiator = res.data;
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {});
    },
    // 节点过滤
    filterNode(value, data) {
      if (!value) return true;
      return data.itemName.indexOf(value) !== -1;
    },
    // 分项工程点击展开树形数据
    selectTree() {
      if (this.editNum == 1) {
        return;
      }
      this.treeStatus = !this.treeStatus;
      // this.selectedId = "";
      this.specialType = "";
    },
    // 选择节点
    checked(data, node) {
      // 一个都没选的情况清空id
      if (node.checkedNodes.length == 0) {
        this.selectedId = "";
        this.specialType = "";
        return;
      }
      // 变量selectedId 没有选择
      if (this.selectedId == "") {
        this.selectedId = data.fkWorkflowId;
        this.specialType = data.itemType;
      } else {
        // 已有一项选择 特殊类型
        if (data.itemType !== 0 || this.specialType !== 0) {
          this.$refs.treeForm.setChecked(data, false);
          this.$message.warning("不同工序流程类型不能合并审批");
        } else {
          // 普通类型
          if (data.fkWorkflowId != this.selectedId) {
            this.$refs.treeForm.setChecked(data, false);
            this.$message.warning("不同工序流程类型不能合并审批");
          }
        }
      }

      // console.log("点击节点信息node",node);
      // console.log(node.checkedNodes);
      // console.log("data",data)
      // let arr = node.checkedNodes;
      // for (let i = 0; i < arr.length; i++) {
      //     if(data.fkWorkflowId == arr[i].fkWorkflowId) {
      //       this.$refs.treeForm.setChecked(data,false);
      //     }

      // }
      // console.log("当前节点data",data);
      // let res = node.checkedNodes[0];
      // // console.log(res);
      // // 选中的分项流程模板ID不等于之前选中才能选
      // if(res.fkWorkflowId !== this.checkedNode.fkWorkflowId){

      // }
      // this.checkedNode = node.checkedNodes;
      // console.log(this.checkedNode);
      // if(data.item)
      // this.$refs.treeForm.setChecked(data,false);
    },
    // 确认后发送查询
    treeConfirm() {
      // this.selectedId = "";
      this.specialType = "";
      this.treeStatus = false;
      // 获取当前选中的节点
      this.treeNode = this.$refs.treeForm.getCheckedNodes();
      // let arr_father = this.$refs.treeForm.getHalfCheckedNodes();
      console.log(this.treeNode);
      if (this.treeNode.length == 0) {
        return true;
      }
      // 确定再进来回显问题
      const arr = [];
      for (let i = 0; i < this.treeNode.length; i++) {
        arr.push(this.treeNode[i].pkId);
      }
      this.haschecked = arr;
      this.itemType = this.treeNode[0].itemType;
      // // 一级和二级名称

      // this.stair1 = arr_father[0].itemName;
      // this.stair2 = arr_father[1].itemName;
      // console.log(this.treeNode)
      this.nodeArr = this.treeNode.map(item => {
        return { fkItemId: item.pkId };
      });
      this.treeId = this.treeNode[0].pkId; // 分项工程ID
      const fkSysItemId = this.treeNode[0].pkId;
      this.queryFlow(fkSysItemId);
    },
    // 根据树形勾选确定查询审批人及获取当前节点信息
    queryFlow(fkSysItemId) {
      this.$api
        .inEstimate({ itemIdStrList: fkSysItemId })
        .then(res => {
          if (res.code === 200) {
            this.newProcessname = res.data.workflowName;
            this.proceName = res.data.workflowName; // 流程图名称
            // this.processName = res.data.itemName;
            this.finishPec = res.data.completeItemName;
            if (this.editNum != 1) {
              this.footType = res.data.surplusMax > 0;
              this.footage = res.data.surplusMax;
            } else {
              this.footType = true;
            }
            // 判断是什么类型，根据类型是否传3级名称 普通类型不传，隧道传
            if (res.data.itemType != 0) {
              this.nodeArr[0].itemName = this.finishPec;
            }

            // this.bpmnImg = res.data.bpmnContent;
            // this.init("canvas");
            // this.$refs.basic.exportDiagram(this.bpmnImg);
            this.nodeDetels = res.data; // 节点返回的信息
            this.principal = res.data.baseSysRole && res.data.baseSysRole.sysUserList.length ? res.data.baseSysRole.sysUserList : []; // 负责人
            // 获取审批人
            this.approverSetting();
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 查看pdf
    lookPdf(item) {
      this.url = item.bookUrl;
      this.number = item.beginPage;
      this.$refs.pdfPiev.pdfShow = true;
    },
    // 上一页
    prePage() {
      let page = this.pageNum;
      page = page > 1 ? page - 1 : this.pageTotalNum;
      if (page == this.pageTotalNum) {
        return;
      }
      this.pageNum = page;
      this.$refs.pdfWrap.scrollTo(0, 0);
    },
    // 下一页
    nextPage() {
      let page = this.pageNum;
      page = page < this.pageTotalNum ? page + 1 : 1;
      if (page == 1) {
        return;
      }
      this.pageNum = page;
      this.$refs.pdfWrap.scrollTo(0, 0);
    },
    // 负责人下拉选中事件
    personCharge(data) {
      this.prinId = data;
    },
    cableck() {
      this.getData();
    },
    // 发起流程 或者 保存草稿
    launchFlow(num) {
      if (!this.nodeDetels.pkId) {
        return this.$message.warning("请选择分项工程");
      }
      // if (!this.prinId.pkId) {
      //   return this.$message.warning("请选择负责人");
      // }
      // 路基
      if (this.itemType == 1) {
        if (!this.footage) {
          return this.$message.warning("剩余最大填高不能小于0米");
        }
        if (!this.footage3) {
          return this.$message.warning("完成量不能小于0米");
        }
      }
      // 隧道
      if (this.itemType == 2) {
        if (!this.footage) {
          return this.$message.warning("剩余进尺不能小于0米");
        }
        if (!this.footage2) {
          return this.$message.warning("施工进尺不能小于0米");
        }
      }
      let params = {
        approveStatus: num, // 审核状态：0：草稿，1：发起审批
        // approver: this.prinId.userName, // 当前审批人
        // fkApproverId: this.prinId.pkId, // 当前审批人ID
        definitionId: this.nodeDetels.definitionId, // 模板定义ID
        fkPrecessId: this.nodeDetels.pkId, // 工序流程ID
        itemType: this.nodeDetels.itemType, // 分项类型，0：通用类型 1：路基土
        processName: this.newProcessname, // 工序流程名称
        reItemApproveDTOS: this.nodeArr,
        // reItemApproveDTOS: [
        //   {
        //     fkItemId: this.treeId, //分项工程ID
        //     itemName: this.finishPec, //完成分项工程名称
        //     partItemName: this.nodeDetels.secondParentName, //分部工程名称
        //     unitItemName: this.nodeDetels.oneParentName, //单位工程名称
        //   },
        // ],
        fillHeight: this.footage, // 剩余最大填高/剩余进尺
        distanceSurface: this.footage2, // 施工面距设计面距离/施工进尺
        prodReProcessFileList: this.accessoryList.filter(item => item.fileUrl) // 附件列表
      };
      const prodWorkflowUserAdds = [];
      this.approvalData.workflowNodeDTOS.forEach(item => {
        if (item.nodeType == 3) {
          item.baseSubWorkflow.workflowNodeDTOS.forEach(e => {
            if (e.nodeType == 2) {
              prodWorkflowUserAdds.push({
                bizType: 0,
                fkRoleId: e.fkRoleId,
                currentNodeId: e.pkId,
                currentPrecessId: item.pkId,
                fkApproverId: e.prodSysRoleVo.selectedUserId
                // sortval:
              });
            }
          });
        }
      });
      prodWorkflowUserAdds.forEach((item, index) => {
        item.sortval = index + 1;
      });
      params.prodWorkflowUserAdds = prodWorkflowUserAdds;
      // 获取里面html的值，赋值给tableDTOS 深拷贝
      const tableList = JSON.parse(JSON.stringify(this.workflowTableList));
      if (tableList.length > 0) {
        console.log(tableList);
        console.log(this.modifiedList);
        tableList.forEach((item, index) => {
          item.tableHtml = JSON.stringify(item.tableHtml);
          if (this.modifiedList[index].tableHtml == item.tableHtml) {
            item.isModified = 0;
          } else {
            item.isModified = 1;
          }
          item.tableHtml = this.utils.zip(JSON.stringify(item.tableHtml));
          item.pkId = item.fkTableId;
        });
      }
      // return console.log(this.modifiedList)
      // tableList
      // --------------------------------谢谢谢谢谢寻寻寻寻寻寻寻寻寻寻寻寻寻寻寻寻寻寻寻寻寻寻

      params.workflowTableList = tableList;
      if (this.editNum == 1) {
        params = { ...params, pkId: this.pkIdItem };
        // 编辑
        this.loading = true;
        this.$api
          .modifyProduction(params)
          .then(res => {
            if (res.code === 200) {
              if (num == 1) {
                this.$message.success("发起成功");
              } else {
                this.$message.success("保存草稿成功");
              }
              this.popup = false;
              this.getData();
            } else {
              this.loading = false;
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
          });
      } else {
        // 新增
        this.loading = true;
        this.$api
          .addProduction(params)
          .then(res => {
            if (res.code === 200) {
              if (num == 1) {
                this.$message.success("新增流程成功");
              } else {
                this.$message.success("保存草稿成功");
              }
              this.getData();
              this.popup = false;
            } else {
              this.loading = false;
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
          });
      }
    },

    // 给表单添加样式
    tableRowClassName({ row }) {
      if (!row.workArea) {
        return "father";
      }
      return "";
    },

    // 输入框输入事件
    feedin(e, type) {
      let val = e;
      val = val.replace(/[^\d.]/g, ""); // 清除"数字"和"."以外的字符
      val = val.replace(/\.{2,}/g, "."); // 只保留第一个. 清除多余的
      val = val.replace(/^0+\./g, "0.");
      val = val.match(/^0+[1-9]+/) ? (val = val.replace(/^0+/g, "")) : val;
      val = val.match(/^\d*(\.?\d{0,2})/g)[0] || "";
      if (this.itemType !== 2) {
        if (!this.footage3 || !this.footage) {
          this.footage2 = "";
        }
        if (this.footage3 && !this.footage) {
          return this.$message.warning("剩余最大填高不能为空");
        }
        if (type == 1) {
          this.footage = val;
        } else {
          this.footage3 = val;
        }
        if (this.footage3 - 0 > this.footage - 0) {
          this.footage3 = this.footage;
          this.footage2 = 0;
        }
        if (!!this.footage && !!this.footage3) {
          this.footage2 = (this.footage - this.footage3).toFixed(2) - 0;
        }
      } else {
        this.footage2 = val;
        if (val > this.footage) {
          this.footage2 = "";
        }
        if (e < 0) {
          e = 0;
          this.footage2 = 0;
        }
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          if (this.itemType == 2 && this.footage2 !== "") {
            const params = {
              distanceSurface: this.footage2,
              itemName: this.nodeDetels.completeItemName
            };
            this.$api
              .searchCompleteItemName(params)
              .then(res => {
                if (res.code == 200) {
                  this.finishPec = res.data;
                  this.nodeArr[0].itemName = this.finishPec;
                } else {
                  this.$message.warning(res.msg);
                }
              })
              .catch(err => {});
          }
        }, 500);
      }
    },
    // 关闭模态框
    btnClose() {
      this.newProcessname = ""; // 流程名
      this.proceName = ""; // 流程图名称
      this.tabTitle = "";
      this.tabContent = "";
      this.accessoryList = [{ id: 1, fileName: "", remark: "", fileUrl: "" }];
    },
    // 关闭节点信息模态框
    closeNodeDialog() {
      this.disposeDialog = false;
    },

    // 获取弹窗里面的tree数据
    launchProcess(id) {
      const ids = [];
      if (id) {
        ids.push(id);
      }
      this.$api
        .getEstimate({ ids })
        .then(res => {
          if (res.code === 200) {
            this.treeData = res.data;
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    // 查看和编辑获取当前的信息 num：1是编辑，2是查看，3是审批
    lookOver(row, type, num) {
      this.lookType = row.approveStatus;
      this.pkIdItem = row.pkId;
      this.svgHtml = "";
      this.activeName = "basicInform";
      // 查询流程信息
      this.loading2 = true;
      this.$api
        .findProcessApproveById({ approveId: row.pkId, type })
        .then(res => {
          if (res.code === 200) {
            this.newProcessname = res.data.processName;
            // 编辑情况下
            if (num == 1) {
              this.editNum = num; // 用来判断是新增还是编辑 保存用==============
              this.footage = res.data.fillHeight;
              this.itemType = res.data.itemType; // 控制隧道还是普通还是路基
              this.treeNode = res.data.reItemApproveDtoList; // 选中节点的信息
              this.nodeArr = res.data.reItemApproveDtoList;
              this.prinId.userName = res.data.approver;
              this.prinId.pkId = res.data.fkApproverId;
              this.footage2 = res.data.distanceSurface;
              this.footage3 = (res.data.fillHeight - res.data.distanceSurface).toFixed(2); // 点击编辑计算完成量
              this.treeId = res.data.reItemApproveDtoList[0].fkItemId; // 选中节点的工序id
              this.launchProcess(this.treeId);
              const node_id = res.data.threeItemId; // 选中节点的工序id三级
              this.haschecked = [];
              this.haschecked.push(node_id);
              this.selectedId = node_id; // 211 311 111   三级这个id
              this.accessoryList = res.data.fileList && !!res.data.fileList.length ? res.data.fileList.map((item, index) => ({ ...item, id: index + 1 })) : [{ id: 1, fileName: "", remark: "", fileUrl: "" }];
              this.$nextTick(() => {
                this.$refs.treeForm.setCheckedKeys(this.haschecked);
              });
              this.queryFlow(node_id); // 根绝工序节点id查询信息
              this.currentPrecessId2 = res.data.currentPrecessId; // 编辑的工序id
              // 处理表格
              const arr3 = JSON.stringify(res.data.workflowTableList);
              this.modifiedList = JSON.parse(arr3);
              this.modifiedList.forEach(item => {
                item.tableHtml = utils.unzip(item.tableHtml);
              });
              this.workflowTableList = res.data.workflowTableList;
              this.workflowTableList.forEach(item => {
                item.tableHtml = utils.unzip(item.tableHtml);
                if (item.tableHtml instanceof Array) {
                } else {
                  item.tableHtml = JSON.parse(item.tableHtml);
                }
              });
              // tab展示
              if (this.workflowTableList && this.workflowTableList.length) {
                this.activeName2 = "first0";
              } else {
                this.activeName2 = "second";
              }

              this.popup = true;
              this.approvalStatus = true;
            }
            // 查看
            if (num == 2) {
              this.disposeData = res.data;
              if (row.approveStatus == "5" || row.approveStatus == "6") {
                this.appDiaType = 4;
              } else {
                this.appDiaType = 1;
              }
              this.proChangeDialog = true;
              this.loading2 = false;
            }
            // 审批按钮需要处理传的数据
            if (num == 3) {
              this.disposeData = res.data;
              if (res.data.itemType != 1) {
                this.disposeData.prodItemList.forEach(item => {
                  if (item.grade === 4) {
                    item.completeQuantities = item.designQuantities;
                  }
                });
              }
              let unitProject = "";
              let partProject = "";
              let outProject = "";
              this.disposeData.reItemApproveDtoList.forEach(item => {
                unitProject = item.unitItemName + "," + unitProject; //单位
                partProject = item.partItemName + "," + partProject; //分部
                outProject = item.itemName + "," + outProject; //完成分项
              });
              this.disposeData.reItemApproveDtoList[0].unitProject = unitProject.slice(0, -1);
              this.disposeData.reItemApproveDtoList[0].partProject = partProject.slice(0, -1);
              this.disposeData.reItemApproveDtoList[0].outProject = outProject.slice(0, -1);
              console.log(this.disposeData.reItemApproveDtoList[0].unitProject); // 拼接名称
              console.log(this.disposeData.reItemApproveDtoList[0].partProject); // 拼接名称
              this.prinIdName2 = res.data.approver; // 负责人
              // 查询负责人,处理必须调用这个接口查
              // const itemId = res.data.reItemApproveDtoList[0].fkItemId;
              // const orgid = localStorage.getItem("orgId");
              // const mobnaid = res.data.prodWorkflowTemplate.pkId;
              // const nodeId = res.data.pkId;
              // this.getstaffList(itemId, orgid, mobnaid, nodeId); // 负责人单独接口
              this.disposeDialog = true;
            }
          } else {
            // this.bpmnImg = "";
            // this.init("lookCanva");
            this.$message.warning(res.msg);
          }
          this.loading2 = false;
        })
        .catch(err => {
          // if (this.$refs.lookCanva) {
          //   this.bpmnImg = "";
          //   this.init("lookCanva");
          // }
          console.log(err);
          this.loading2 = false;
        });
    },

    // 表格管理返回来的表格
    tabChange(data, index) {
      this.rowIndex = index;
      this.tabTitle = data.tableName;
      this.tabContent = utils.unzip(data.tableHtml);
      if (this.tabContent instanceof Array) {
      } else {
        this.tabContent = JSON.parse(this.tabContent);
      }

      this.tabData = data.tableColumnData == null ? {} : JSON.parse(data.tableColumnData);
      // this.$nextTick(() => {
      //   this.handleTable();
      // });
    },
    // 只有处理才调用，根据流程主键id获取员工列表====>负责人那个玩意 审批节点主键id，当新增流程时，传null，非新增必传，现在用的是节点资料的接口获取里面的负责人
    // getstaffList(itemId, orgId, pkId, nodeId) {
    //   const params = {
    //     itemId,
    //     orgId,
    //     workflowId: pkId,
    //     processId: nodeId
    //   };
    //   this.$api
    //     .getstaffList(params)
    //     .then(res => {
    //       if (res.code == 200 && res.data !== null) {
    //         this.roleDtoName = res.data.roleName;
    //         this.disposeMan = res.data.sysUserList; // 动态传值给处理那边的负责人
    //       }
    //     })
    //     .catch(err => { });
    // },

    // 搜索按钮点击
    search() {
      this.pageNum = 1;
      this.getData();
    },
    // 撤回
    withdraw(id) {
      this.loading2 = true;
      this.$api
        .findProcessApproveById({ approveId: id, type: 2 })
        .then(res => {
          this.loading2 = false;
          if (res.code == 200) {
            this.disposeData = res.data;
            this.appDiaType = 3;
            this.proChangeDialog = true;
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading2 = false;
        });
    },
    // 删除
    handleDelete(id) {
      this.$confirm("确定删除该流程, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.loading2 = true;
        this.$api
          .deleteProduction({ pkId: id })
          .then(res => {
            if (res.code === 200) {
              this.$message.success("删除成功");
              this.loading2 = false;
              this.getData();
            } else {
              this.loading2 = false;
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading2 = false;
          });
      });
    },
    clearLog(id) {
      this.$confirm("确定清除该施工验收审批信息?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.loading2 = true;
        this.$api
          .deleteProduction2({ pkId: id })
          .then(res => {
            if (res.code === 200) {
              this.$message.success("清除审批记录成功");
              this.getData();
            } else {
              this.$message.warning(res.msg);
            }
            this.loading2 = false;
          })
          .catch(err => {
            this.loading2 = false;
          });
      });
    },
    // 选择每页多少条
    handleSizeChange(data) {
      this.pageSize = data;
      this.getData();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 点击那一页
    handleCurrentChange(data) {
      // Object.keys(this.searchData).forEach(key => {
      //   if (this.searchData[key] instanceof Array) {
      //     this.searchData[key] = [];
      //   } else {
      //     this.searchData[key] = "";
      //   }
      // });
      console.log(333);
      this.pageNum = data;
      this.getData();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 创建流程图预览的方法
    init(domId) {
      // 获取到属性ref为“canvas”的dom节点
      document.getElementById(domId).innerHTML = "";
      const canva = this.$refs[domId];

      // 新建流程 用dom元素绘画svg ====> canvas
      this.bpmnModeler = new CustomViewer({ container: canva });

      // this.bpmnImg 是xml 后端返回的数据
      this.bpmnModeler.importXML(this.bpmnImg, err => {
        if (err) {
          if (this.lookType == 0) {
            this.$message.warning("获取流程图失败");
          }
        } else {
          // 这里是成功之后的回调, 可以在这里做一系列事情
          // this.bpmnModeler.get("canvas").zoom('fit-viewport', 'auto'); //get里面必须叫canvas
        }
      });
    },
    cleanData() {
      this.disposeData = {};
      this.pkIdItem = "";
      this.disposeMan = [];
      this.roleDtoName = "";
    },
    // 处理表格input selcect
    handleTable() {
      const dom_class = document.getElementsByClassName("html-content")[0];
      const inpAll = dom_class.getElementsByTagName("input");
      const select = dom_class.getElementsByTagName("select");
      const textarea = dom_class.getElementsByTagName("textarea");
      for (let i = 0; i < inpAll.length; i++) {
        inpAll[i].disabled = true;
        // 判断有没没有数据
        if (this.tabData.inpData) {
          inpAll[i].value = this.tabData.inpData[i];
        }
      }
      for (let i = 0; i < textarea.length; i++) {
        textarea[i].disabled = true;
        // 判断有没没有数据
        if (this.tabData.textData) {
          textarea[i].value = this.tabData.textData[i];
        }
      }
      for (let j = 0; j < select.length; j++) {
        select[j].disabled = true;
        if (this.tabData.selData) {
          select[j].options[this.tabData.selData[j]].selected = true;
        }
      }
    },
    // 树形超过宽度提示
    onMouseEnter(str) {
      this.$nextTick(() => {
        const tag = this.$refs[str];
        const parentWidth = tag.parentNode.offsetWidth; // 获取元素父级可视宽度
        const contentWidth = tag.offsetWidth; // 获取元素可视宽度
        this.isShowTooltip = contentWidth <= parentWidth;
      });
    },
    // 输入禁用
    keyDown(e) {
      const key = e.key;
      if (key === "e" || key === "-" || key === "+") {
        e.returnValue = false;
        return false;
      }
      return true;
    },
    // 添加附件
    addAcc(row) {
      this.accessoryList = [
        ...this.accessoryList,
        {
          id: this.accessoryList[this.accessoryList.length - 1].id + 1,
          fileName: "",
          remark: ""
        }
      ];
    },
    // 删除附件
    delAcc(row) {
      if (this.accessoryList.length === 1) {
        this.accessoryList = [{ id: 1, fileName: "", remark: "", fileUrl: "" }];
      } else {
        this.accessoryList = this.accessoryList.filter(item => item.id !== row.id);
      }
    },
    // 下载附件
    downloadAcc(row) {
      const url = row.fileUrl;
      const name = row.fileName;
      this.fileLinkToStreamDownload(url, name, "pdf");
    },
    fileLinkToStreamDownload(url, fileName, type) {
      const xhr = new XMLHttpRequest();
      xhr.open("get", url, true);
      xhr.setRequestHeader("Content-Type", `application/${type}`);
      xhr.responseType = "blob";
      xhr.onload = function() {
        if (this.status == 200) {
          // 接受二进制文件流
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
    },
    // 上传按钮
    uploadAcc(row) {
      this.$nextTick(() => {
        this.$refs.upload.click();
      });
      this.nowUploadObj = row;
    },
    // 上传
    upLoad() {
      const fileObj = this.$refs.upload.files[0];
      // console.log(this.$refs.upload.files[0]);
      if (!fileObj) {
        return this.$message({
          type: "warning",
          message: "请选择上传的文件"
        });
      }
      if (fileObj.size <= 0) {
        return this.$message.warning("文件大小不能为0kb");
      }
      // 判断文件类型
      if (!this.fileType.includes(fileObj.type)) {
        this.$refs.upload.value = "";
        return this.$message.warning("仅支持上传pdf，jpeg，jpg，pdf，docx，xlsx文件");
      }
      const size = 100 * 1024 * 1024;
      if (fileObj.size > size) {
        this.$refs.upload.value = "";
        return this.$message.warning("附件大小最大为100M");
      }
      const f = this.$refs.upload.files;
      const typeName = f[0].name.substr(f[0].name.lastIndexOf(".")).toLowerCase();
      // return console.log(suffixname)
      const blobFile = this.$options.methods.dataURLtoBlob.bind(this)(fileObj);
      const filename = fileObj.name;
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
            this.$message.warning(res.msg);
            this.loading = false;
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
            _this.nowUploadObj.fileUrl = path;
            _this.nowUploadObj.fileName = filename;
            const obj = _this.$refs.upload;
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
    // 预览
    preview(row) {
      const str = row.fileUrl.substring(row.fileUrl.lastIndexOf(".") + 1);
      if (str == "xlsx" || str == "docx") {
        this.previewType = 1;
        this.nowPreviewObj = row;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      } else if (str == "pdf") {
        this.number = 1;
        this.previewType = 2;
        this.url = row.fileUrl;
        this.$refs.pdfPiev.pdfShow = true;
      } else {
        this.previewType = 3;
        this.nowPreviewObj = row;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      }
    },
    handleScroll(val) {
      if (this.$refs.scroll != undefined) {
        this.$refs.scroll.forEach(item => {
          item.blur();
        });
      }
    },
    tdBlur(item, id, val, e, i) {
      if (item.arr[id].checkout == true) {
        return;
      }
      item.arr[id].name = val;
      e.target.innerText = item.arr[id].name;
      if (i.disabled) {
        // let data = JSON.parse(sessionStorage.getItem("user"))
        i.id = this.user2.pkId;
      }
      if (!val) {
        i.id = "";
      }
      console.log();
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
    }
  }
};
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  align-items: center;
  background: $searcHeder;
  height: 80px;

  .head {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 4px 0;
    align-items: center;

    .el-form {
      display: flex;
      align-items: center;

      .el-select,
      .el-input {
        width: 150px;
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

.dialogMain2 {
  height: 500px;
}

.dialogMain {
  padding: 0;
  // border-right: 1px solid #000;
  margin-left: 10px;
  height: 480px;

  .dialogMain-h1 {
    font-size: 20px;
    text-align: center;
    margin: 5px 0;
  }

  .html-content {
    position: relative;
  }

  .html-content:after {
    content: "";
    position: absolute;
    top: 0;
    right: 0px;
    background: transparent;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
}

.aside {
  width: 320px;
}

.aside-li {
  display: flex;
  margin-bottom: 3px;
  border: 1px solid #bbb3b3;
}

.aside-div-left,
.aside-div-right {
  height: 36px;
  line-height: 36px;
}

.aside-div-left {
  width: 120px;
  text-align: center;
  background-color: #ccc;
}

.aside-div-right {
  flex: 1;
  overflow: hidden;
  /*超出部分隐藏*/
  white-space: nowrap;
  /*禁⽌换⾏*/
  text-overflow: ellipsis;
  /*省略号*/
  margin-left: 5px;
  padding-right: 4px;
}

.el-radio-group {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 4px;

  .el-radio-button {
    width: 100%;

    /deep/ span {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

// 发起流程
.launch {
  width: 100px;
  height: 28px;
  margin-top: 7px;
}

/deep/ .el-dialog__footer {
  text-align: center !important;
}

.project-list {
  display: flex;

  .hit {
    cursor: pointer;
  }

  .list-item {
    flex: 1;
    display: flex;
    align-items: center;
    border: 1px solid #edecec;
    margin-right: 20px;
    margin-bottom: 10px;
    font-size: 14px;

    .larby {
      min-width: max-content;
      padding: 8px 5px;
      background-color: #f3f3f3;
      border-right: 1px solid #edecec;
    }

    .item-detels {
      max-width: 320px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding: 0 10px;

      .el-icon-more {
        border: 1px solid rgb(211, 198, 198);
        margin-left: 10px;
      }
    }

    .item-detels2 {
      max-width: 300px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding: 0 10px;
    }
  }
}

.flow-chart {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: auto;
}

.process-name {
  position: absolute;
  top: -3px;
  font-size: 20px;
  font-weight: 600;
  z-index: 10;
  // padding-left: 50px;
  // margin-bottom: 20px;
}

.canvas {
  width: 100%;
  height: 100%;
  overflow: auto;
  text-align: center;
  // object-fit: fill;
}

// 树形工程
.tree-project {
  width: 500px;
  background-color: #fff0f0;
  position: absolute;
  left: 186px;
  top: 40px;
  border: 1px solid #edc7c7;
  z-index: 999;

  // 头部搜索
  .head-selc {
    display: flex;
    justify-content: space-between;
    padding: 5px 10px;

    .text-select {
      margin-right: 20px;
    }
  }

  // 树形数据
  .tree-list {
    height: 400px;
    overflow: auto;

    // 树形结构让叶子才显示选择框
    /deep/ .el-tree {
      width: 100%;
      height: 400px;
      overflow: auto;

      .label {
        display: block;
        width: 250px;
        overflow: hidden;
        /*超出部分隐藏*/
        white-space: nowrap;
        /*禁⽌换⾏*/
        text-overflow: ellipsis;
        /*省略号*/
      }

      .el-tree-node {
        .is-leaf + .el-checkbox .el-checkbox__inner {
          display: inline-block;
        }

        .el-checkbox .el-checkbox__inner {
          display: none;
        }
      }
    }
  }
}

.btn-serach {
  margin-left: 20px;
  height: 28px;
}

.new-process {
  width: 100%;
  flex: 1;

  /deep/ .el-input__inner {
    border: none;
  }
}

/deep/ .bjs-powered-by {
  display: none;
}

// .box-dialog {
//   height: 600px;
//   /deep/ .el-table__body-wrapper {
//     max-height: 480px;
//     overflow-y: auto;
//   }
// }
.tables {
  height: 500px;

  .empty {
    margin: 140px 0;
  }
}

.lf-aside {
  width: 360px;

  // overflow: auto;
}

.table1 {
  height: 500px;
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

.preview {
  /deep/ .el-dialog__headerbtn {
    display: none;
  }

  .previewHeight {
    min-height: 100px;
    max-height: 650px;
    overflow: auto;
    text-align: center;
    background: url("../../assets/loading.gif") no-repeat center center;
  }

  .iframe {
    width: 100%;
    height: 640px;
  }

  .img {
    max-width: 900px;
  }
}

.preRemark {
  display: -webkit-box;
  word-break: break-all;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.print-export {
  position: absolute;
  top: 70px;
  right: 30px;
}

.gao {
  height: 638px !important;
}

.approval-dialog {
  overflow: auto;
  padding: 20px;
  height: 580px;
  position: relative;

  .approver-workflowName {
    position: absolute;
    top: 16px;
    left: 12px;
    font-size: 16px;
    font-weight: 800;
  }

  .begin {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 1px solid;
    text-align: center;
    line-height: 50px;
    margin: 0 auto;
  }

  .begin-icon {
    margin: 0 auto;
    text-align: center;
    font-size: 30px;
  }

  .acceptance-node {
    border: 1px dashed;
    width: 80%;
    height: 150px;
    margin: 0 auto;
    text-align: center;
    margin-bottom: 30px;
    position: relative;

    .node-name {
      position: absolute;
      left: 6px;
      top: 1px;
    }

    .child-node {
      display: inline-block;
      width: 120px;
      height: 80px;
      line-height: 80px;
      border: 1px solid;
      position: relative;
      margin-right: 30px;
      vertical-align: middle;
      margin-top: 16px;
      border-radius: 6px;

      .child-node-role {
        white-space: nowrap;
        overflow: hidden;
      }

      .arrows-right {
        position: absolute;
        right: -32px;
        top: 35%;
        font-size: 31px;
      }

      .approval-select {
        position: absolute;
        bottom: -60px;
      }
    }

    .arrows-bottom {
      position: absolute;
      font-size: 30px;
      bottom: -32px;
      left: 48%;
    }
  }

  .finish {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 1px solid;
    text-align: center;
    line-height: 50px;
    margin: 0 auto;
    background-color: #606266;
    position: relative;

    .finish-text {
      position: absolute;
      right: -42px;
    }
  }
}

.background-red {
  /deep/ .el-input__inner {
    padding: 0;
    background-color: #f4b4bc !important;
  }
}

.tab-box {
  position: relative;
  overflow: auto;

  .text-html {
    margin-bottom: 20px;

    input {
      text-align: center;
    }
  }
}

/deep/ .el-dialog__body {
  position: relative;
}

.title-item {
  display: flex;
  align-items: center;
  border: 1px solid #edecec;
  margin-right: 20px;
  margin-bottom: 10px;
  font-size: 14px;
  position: absolute;
  top: 10px;
  left: 20px;
  width: 97%;

  .larby {
    width: 186px;
    height: 39px;
    line-height: 39px;
    text-align: center;
    background-color: #f3f3f3;
    border-right: 1px solid #edecec;
  }

  .item-details {
    flex: 1;
    padding: 0 10px;
    height: 37px;
    line-height: 37px;
    color: #918484;
  }

  .el-icon-more {
    position: absolute;
    right: 10px;
    top: 10px;

    border: 1px solid rgb(211, 198, 198);
    margin-left: 10px;
  }
}

.hint {
  text-align: center;
  font-size: 30px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.box {
  padding: 60px 20px 0 20px;
  height: 700px;
}

.loaders {
  width: 25px;
  height: 25px;
}
</style>
