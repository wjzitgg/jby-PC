<template>
  <div class="app-container" v-loading="loading">
    <!-- 搜索栏 -->
    <div class="header-search">
      <el-form label-width="80px" :inline="true" class="myform">
        <el-form-item label="标段项目" v-if="![5, 7].includes(user.orgType)">
          <treeSelect @selectIds="selectIds"></treeSelect>
        </el-form-item>
        <!-- <el-form-item label="标段" v-if="user.orgType !== 5" label-width="60px">
          <el-select v-model="inpData.fkBidProjectId" :disabled="!inpData.fkProjectId" size="mini" v-if="user.orgType === 2 || user.orgType === 3 || user.orgType === 9" class="wh-140">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in proOptions" :key="item.fkBidProjectId" :value="item.fkBidProjectId" :label="item.fkBidProjectName"></el-option>
          </el-select>
          <el-select v-model="inpData.fkBidProjectId" size="mini" class="wh-140" v-else>
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in options" :key="item.pkId" :value="item.pkId" :label="item.projectName"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="变更类型" v-if="typeShow">
          <el-select v-model="inpData.fkWorkflowTemplateId" size="mini" class="wh-140">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in changeTypeOptins" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="变更状态" v-if="typeShow">
          <el-select v-model="inpData.changesStatus" size="mini" class="wh-140">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in changeStatsOptins" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发起人" v-if="user.orgType == 5 && typeShow">
          <el-select v-model="inpData.createUser" size="mini" class="wh-140">
            <el-option value="" label="全部"></el-option>
            <el-option v-for="item in sendPeoOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="变更项目" v-if="typeShow">
          <el-input class="wh-140" size="mini" v-model.trim="inpData.changesName" maxlength="50"></el-input>
        </el-form-item>
        <el-form-item label="填表人" v-if="typeShow">
          <el-input class="wh-140" size="mini" v-model.trim="inpData.createUserName" maxlength="20"></el-input>
        </el-form-item>

        <el-button size="mini" type="primary" class="ml-20 search el-button-primary" icon="el-icon-search" @click="btnSearch">查询</el-button>
      </el-form>
      <el-button size="mini" type="primary" class="el-button-primary" v-has="'design:change:add'" v-if="user.orgType !== 4 && typeShow" @click="openAddDialog(1)">发起变更</el-button>
    </div>
    <!-- 表格 -->
    <div class="table-data" v-if="typeShow">
      <el-table ref="tables" :data="tableData" height="100%" stripe :header-cell-style="{ background: '#f1f6ff' }" :tooltip-effect="'light'">
        <el-table-column label="序号" align="center" width="80">
          <template slot-scope="scope">
            <div style="text-align: center">
              {{ (page.pageNum - 1) * page.pageSize + (scope.$index + 1) }}
            </div>
          </template>
        </el-table-column>
        <!-- <el-table-column label="项目" prop="fkProjectName" align="center" v-if="user.orgType === 2 || user.orgType === 3 || user.orgType === 9" show-overflow-tooltip> </el-table-column> -->
        <el-table-column label="标段项目" prop="fkBidProjectName" align="center" v-if="user.orgType !== 5" show-overflow-tooltip> </el-table-column>
        <el-table-column label="变更项目" prop="changesName" align="center">
          <template slot-scope="{ row }">
            <div class="ellipsistwo" :title="row.changesName">{{ row.changesName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="变更类型" prop="fkWorkflowTemplateName" align="center"> </el-table-column>
        <el-table-column label="发起人" prop="createUserName" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="发起日期" prop="createTime" align="center" show-overflow-tooltip> </el-table-column>
        <el-table-column label="状态" prop="changesStatusStr" align="center" show-overflow-tooltip>
          <!-- <template slot-scope="{ row }">
             0：草稿，1：审批中，2：审批完成 ， 3：已拒绝, 4：签章中, 5：签章已完成
            {{ stateList[row.changesStatus] }}
          </template> -->
          <template slot-scope="{ row }">
            <div style="display: flex; align-items: center; justify-content: center">
              <div>{{ row.changesStatusStr }}</div>
              <img src="../../assets/loader.gif" alt="" class="loaders" v-if="row.changesStatusStr == '数据处理中'" />
              <!-- <img src="../../assets/loader.gif" alt="" class="loaders" v-if="row.changesStatus==10"> -->
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="250">
          <template slot-scope="{ row }">
            <el-button size="mini" plain v-show="row.sealStatus == '1'" @click="chapterClick(row)">发起用章</el-button>
            <el-button size="mini" plain v-show="row.sealStatus == '2'" @click="chapterClick(row)">重新发起用章</el-button>
            <el-button size="mini" plain v-has="'design:change:query'" type="primary" v-show="![5, 6].includes(row.changesStatus)" @click="openApprovalDialog(1, row)">查看</el-button>
            <el-button size="mini" plain v-has="'design:change:query'" type="primary" v-show="[5, 6].includes(row.changesStatus)" @click="openApprovalDialog(4, row)">查看</el-button>
            <el-button size="mini" plain v-has="'design:change:update'" type="success" v-show="row.editStatus" @click="openAddDialog(2, row)">{{ [3, 7].includes(row.changesStatus) ? "重新发起" : "编辑" }}</el-button>
            <el-button size="mini" plain v-has="'design:change:delete'" type="danger" v-show="row.deleteStatus" @click="handelDel(row)">删除</el-button>
            <el-button size="mini" plain type="danger" v-show="row.revokeStatus" @click="openApprovalDialog(3, row)">撤回</el-button>
            <el-button size="mini" plain type="primary" v-show="row.changeStatus == 1" @click="openApprovalDialog(2, row)">处理</el-button>
            <el-button size="mini" plain type="primary" v-show="row.sealApproveStatus == 1" @click="sealApproveStatus(row)">{{ row.sealPersonStatus ? "盖章" : "审批" }}</el-button>
            <el-button size="mini" plain type="primary" v-show="row.sealWithdrawStatus == 1" @click="revocation(row)">撤回</el-button>
            <!-- <el-button size="mini" plain type="primary" v-show="row.sealStatus" @click="openLaunchDialog(row)">发起签章</el-button> -->
            <!-- <el-button size="mini" plain type="primary" v-show="row.signatureStatus == 1" @click="openSignatureDialog(row)">签章</el-button> -->
            <el-button size="mini" plain type="primary" v-show="row.transSealStatus == 1" @click="openPassDialog(row)">转交签署</el-button>
            <!-- <el-button size="mini" plain type="success" v-has="'design:change:download'" v-show="row.downloadStatus" @click="downloadContract(row)">下载合同</el-button> -->
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
    <!-- 分页组件 -->
    <tablePaging v-if="typeShow" :pageSize="page.pageSize" :total="total" :currentPage="page.pageNum" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></tablePaging>
    <!-- 新增，编辑弹框 -->
    <el-dialog :title="addTitle" :visible="addDialog" :width="user.orgType !== 5 ? '60%' : ''" center top="0vw" @close="addDialogClose(false)" v-loading="loading" :close-on-press-escape="false" v-dialogDrag :close-on-click-modal="false">
      <div class="dialog-form">
        <!-- 非项目部新增时展示 -->
        <el-form :inline="true" :model="formData" :rules="rules" ref="addform1" label-width="80px" v-if="user.orgType !== 5">
          <el-form-item label="变更编号" label-width="120px" prop="changesCode">
            <el-input size="mini" v-model.trim="formData.changesCode" class="wh-200" :disabled="!!allowModify" :maxlength="limitNum"></el-input>
          </el-form-item>
          <el-form-item label="项目" prop="fkProjectId" v-if="user.orgType === 2 || user.orgType === 3 || user.orgType === 9">
            <el-select v-model.trim="formData.fkProjectId" size="mini" @change="proChange($event, 2)" class="wh-200">
              <el-option v-for="item in options" :key="item.pkId" :value="item.pkId" :label="item.projectName"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="标段" prop="fkBidProjectId" v-if="user.orgType === 2 || user.orgType === 3 || user.orgType === 9">
            <el-select v-model.trim="formData.fkBidProjectId" size="mini" :disabled="!formData.fkProjectId" class="wh-200">
              <el-option v-for="item in dialogProOptions" :key="item.fkBidProjectId" :value="item.fkBidProjectId" :label="item.fkBidProjectName"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <el-form label-width="120px" :model="formData" :rules="rules" ref="addform2">
          <el-form-item label="变更编号" v-if="user.orgType === 5" prop="changesCode">
            <el-input size="mini" v-model.trim="formData.changesCode" class="wh-87per" :disabled="!!allowModify" :maxlength="limitNum"></el-input>
          </el-form-item>
          <el-form-item label="变更名称" prop="changesName">
            <el-input size="mini" v-model.trim="formData.changesName" class="wh-87per" maxlength="50"></el-input>
          </el-form-item>
          <el-form-item label="变更类型" prop="fkWorkflowTemplateId">
            <el-select v-model="formData.fkWorkflowTemplateId" :disabled="user.orgType !== 5 && !formData.fkBidProjectId" size="mini" class="wh-87per" @change="typeChange">
              <el-option v-for="item in changeTypeOptins" :key="item.value" :label="item.label" :value="item.value"> </el-option>
            </el-select>
            <!-- <span class="priviewFlow" @click="openFlowDialog">预览流程</span> -->
          </el-form-item>
          <!-- <el-form-item label="第一节点负责人" prop="fkApproverId">
          <el-select v-model="formData.fkApproverId" size="mini" class="wh-87per" :disabled="!formData.fkWorkflowTemplateId">
            <el-option v-for="item in approvalOptions" :key="item.value" :label="item.label" :value="item.value"> </el-option>
          </el-select>
        </el-form-item> -->
          <el-form-item label="设置审批人">
            <el-button size="mini" :disabled="!formData.fkWorkflowTemplateId || dis" type="danger" v-if="!approvalStatus" @click="setWorldata">未设置</el-button>
            <el-button size="mini" :disabled="!formData.fkWorkflowTemplateId || dis" type="success" v-if="approvalStatus" @click="setWorldata">重新设置</el-button>
          </el-form-item>
          <el-tabs v-model="activeName" type="card">
            <el-tab-pane label="变更信息" name="1">
              <el-form-item label="变更设计原因" prop="changesReason">
                <el-input v-model="formData.changesReason" type="textarea" maxlength="1500" :rows="4" resize="none" class="wh-87per"> </el-input>
              </el-form-item>
              <el-form-item label="变更设计方案" prop="changesPlan">
                <el-input v-model="formData.changesPlan" type="textarea" maxlength="2000" :rows="4" resize="none" class="wh-87per"> </el-input>
              </el-form-item>
              <el-form-item label="变更预估成本" prop="changesCost">
                <el-input v-model="formData.changesCost" type="textarea" maxlength="2000" :rows="4" resize="none" class="wh-87per"> </el-input>
              </el-form-item>
              <el-form-item label="附件">
                <el-button size="small" type="primary" class="el-button-primary" @click="uploading" v-if="formData.fileList.length < 10">点击上传</el-button>
                <div class="fileList">
                  <div class="fileList-item" v-for="(row, idx) in formData.fileList" :key="idx">
                    <div class="fileName" :title="row.fileName" @click="preview(row.fileUrl)">{{ row.fileName }}</div>
                    <span class="delFile" @click="removefile(row, idx)">X</span>
                  </div>
                </div>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane v-for="(item, index) in tableDTOS" :key="index" :label="item.tableName" :name="2 + index + ''">
              <div class="tab-box h-480" @scroll="handleScroll">
                <div class="text-html">
                  <table style="border-collapse: collapse; overflow: auto; margin: 0 auto" ref="printPage">
                    <tr v-for="(item, idx) in item.tableHtml" :key="idx" style="" v-show="item.status">
                      <td style="box-sizing: content-box; border: none; margin: 0; padding: 0" :contentEditable="i.attributeTypes == 1 && i.disabled == true && i.checkout == false" @blur="tdBlur(item, id, $event.target.innerText, $event, i)" v-for="(i, id) in item.arr" :style="[i.style]" :key="id" :rowspan="i.row" :colspan="i.span">
                        <span v-if="i.attributeTypes == 1 && i.checkout == false">{{ i.name }}</span>
                        <el-input v-if="i.attributeTypes == 1 && i.checkout == 1" :disabled="i.id != '' && i.id == user.pkId && i.name != ''" @input="tdNameChange(item, id, i.name)" @blur="tdNameBlur(item, id, i.name)" v-model="i.name" size="mini"></el-input>
                        <span v-if="i.attributeTypes == 3">{{ i.signatureDate.content }}:<img width="100px" crossorigin="anonymous" :src="i.signatureDate.img" alt=""/></span>
                        <el-select ref="scroll" v-if="i.attributeTypes == 2" size="mini" :disabled="i.id != '' && i.id == user.pkId && i.name != ''" v-model="i.name" placeholder="请选择">
                          <el-option v-for="(e, index) in i.option" :key="index" :label="e.label" :value="e.label"></el-option>
                        </el-select>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </div>
      <div slot="footer">
        <!-- <el-button type="primary" class="el-button-primary" @click="btnOk(1)">发起</el-button> -->
        <el-button type="primary" class="el-button-primary" @click="checkCode" v-if="!siStatus">发起</el-button>
        <el-button type="primary" class="el-button-primary" @click="signerClick" v-if="siStatus">签名</el-button>
        <el-button type="primary" class="el-button-primary" @click="btnOk(0)">保存</el-button>
        <el-button type="primary" plain @click="addDialogClose(false)">取 消</el-button>
      </div>
    </el-dialog>
    <!-- 审批，查看，撤回弹框 -->
    <approvalDialog :state="[2, 4, 5, 6].includes(state)" :pdfUrl="pdfUrl" :appDiaType="appDiaType" :showData="showData" :approvalTitle="approvalTitle" :approvalDialog="approvalDialog" @close="approvalDialogClose" @getList="searchPageDesign"></approvalDialog>
    <!-- 发起签章弹框 -->
    <el-dialog title="发起签章" :visible="launchDialog" @close="closeLaunchDialog" width="70%" top="2vw" v-loading="loading" :close-on-press-escape="false" v-dialogDrag :close-on-click-modal="false">
      <div class="show-tow dialog-form">
        <div class="left">
          <div class="custom-field">
            <el-form :inline="true" label-width="110px">
              <el-form-item label="本单位持章人">
                <el-select size="mini" @change="sealerChange" v-model="sealerId" placeholder="请选择" style="width: 100%">
                  <el-option v-for="item in stampPeoList" :key="item.value" :value="item.value" :label="item.label"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </div>
          <div style="margin-left: 40px; margin-top: 20px">
            <div>
              <div style="width: 100px; height: 100px; text-align: center; background: #f3f3f3">
                <i class="el-icon-s-check" style="font-size: 22px; margin-top: 20px"></i>
                <el-button @click="firstParty" type="text" style="display: block; margin: 0 auto; margin-top: 10px">点击盖章</el-button>
              </div>
              <div style="width: 100px; text-align: center">
                <p>申请人盖章</p>
              </div>
            </div>
            <div class="appSealer">
              <p>审批人签署盖章位置设置：</p>
            </div>
            <div class="approvers" v-if="this.stampUnitList.length > 1">
              <div class="approvers-item" v-for="item in this.stampUnitList.slice(1)" :key="item.id">
                <div style="width: 100px; height: 100px; text-align: center; background: #f3f3f3">
                  <i class="el-icon-s-check" style="font-size: 22px; margin-top: 20px"></i>
                  <el-button @click="quoteBquote(item)" type="text" style="display: block; margin: 0 auto; margin-top: 10px">点击盖章</el-button>
                </div>
                <div style="width: 100px; text-align: center">
                  <p>{{ item.orgName }}盖章</p>
                </div>
              </div>
            </div>
          </div>
          <div class="explain">
            说明：<br />
            请按对应组件，拖拽图标到对应的电子合同签名位置。设置好对应签名位置后，即可保存发送
          </div>
          <div class="launchDialog-btns">
            <el-button size="mini" type="primary" class="el-button-primary" @click="startSeal">发起签章</el-button>
            <el-button size="mini" @click="closeLaunchDialog">取消</el-button>
          </div>
        </div>
        <!-- width:794px;height:1123px; -->
        <div class="right" style="position: relative; width: 476px; height: 673.6px" v-if="launchDialog">
          <div class="right-box">
            <pdf style="width: 100%" :page="pageNum" :src="pdfUrl" @progress="loadedRatio = $event" @num-pages="pageTotalNum = $event"></pdf>
          </div>
          <!-- ============================================= -->
          <el-button icon="el-icon-arrow-left" size="mini" @click="prePage" style="position: absolute; z-index: 10; left: -17px; top: 50%"></el-button>
          <span class="pdf-page" style="position: absolute; z-index: 10; left: 46%"> {{ pageNum }}/{{ pageTotalNum }}</span>
          <el-button size="mini" icon="el-icon-arrow-right" @click="nextPage" style="position: absolute; z-index: 10; top: 50%; right: -17px"> </el-button>
          <!-- ============================================= -->
          <!-- 签名组件 -->
          <signBox v-for="(item, idx) in stampList" :key="item.id" v-show="item.page === pageNum" @close="closeSign(item, idx)" @getPosition="getPosition($event, item)" :content="item.content" :top="item.ycoordinate" :left="item.xcoordinate" />
        </div>
      </div>
    </el-dialog>
    <!-- 转交签章弹框 -->
    <el-dialog title="转交签章" @close="closePassDialog" :visible="passDialog" top="2vw" v-loading="loading" :close-on-press-escape="false" v-dialogDrag :close-on-click-modal="false">
      <div class="passDialog dialog-form">
        <div class="passDialog-left">
          <div>签章人授权处理：</div>
          <!-- 树形 -->
          <div class="tree">
            <el-tree ref="tree" node-key="pkId" :data="treeList" :defaultProps="defaultProps" show-checkbox default-expand-all check-strictly @check-change="treeCheckClick"> </el-tree>
          </div>
          <div class="passDialog-btns">
            <el-button size="mini" type="primary" class="el-button-primary" @click="deliver">确定转交</el-button>
            <el-button size="mini" @click="closePassDialog">取消</el-button>
          </div>
        </div>
        <div class="passDialog-right" title="点击预览" @click="preview(pdfUrl)" v-if="passDialog">
          <pdf style="width: 100%" :page="pageNum" :src="pdfUrl" @progress="loadedRatio = $event" @num-pages="pageTotalNum = $event"></pdf>
          <!-- ============================================= -->
          <el-button icon="el-icon-arrow-left" size="mini" @click="prePage" style="position: absolute; z-index: 10; left: -17px; top: 50%"></el-button>
          <span class="pdf-page" style="position: absolute; z-index: 10; left: 46%"> {{ pageNum }}/{{ pageTotalNum }}</span>
          <el-button size="mini" icon="el-icon-arrow-right" @click="nextPage" style="position: absolute; z-index: 10; top: 50%; right: -17px"> </el-button>
          <!-- ============================================= -->
        </div>
      </div>
    </el-dialog>
    <!-- 签章弹框 -->
    <el-dialog width="80%" top="5vw" :visible="signatureDialog" @close="closeSignatureDialog" v-dialogDrag :close-on-click-modal="false" :close-on-press-escape="false">
      <div class="dialog-form">
        <div class="mt-10"></div>
        <iframe :src="signatureUrl" height="680px" width="100%" name="demo" scrolling="auto" sandbox="allow-same-origin allow-scripts"></iframe>
      </div>
    </el-dialog>
    <!-- 预览流程图弹框 -->
    <el-dialog title="流程图" :visible.sync="flowDialog">
      <div class="flow dialog-form">
        <div class="pre-can" ref="preCan" id="preCan"></div>
      </div>
    </el-dialog>
    <!-- 查看图片，work，excel文档使用的弹框 -->
    <el-dialog :close-on-press-escape="false" title="" :visible.sync="previewDialog" class="preview">
      <div class="previewHeight dialog-form" ref="previewHeight">
        <iframe ref="iframe" class="iframe" :src="'https://view.officeapps.live.com/op/embed.aspx?src=' + url" v-if="previewType == 1"></iframe>
        <img class="img" :src="url" alt="" v-if="previewType == 3" />
      </div>
    </el-dialog>
    <!-- 查看pdf弹框-->
    <pdfPiev ref="pdfPiev" :urlr="url" />
    <!-- 上传使用的input -->
    <input v-show="false" type="file" ref="files" id="upload" @change="upLoad" />
    <chapterProcess @init="searchPageDesign" :chapterDialog.sync="chapterDialog" :bizType="3" :bizId="bizId"></chapterProcess>
    <!-- 设置审批人 -->
    <el-dialog :close-on-press-escape="false" title="设置审批人" width="70%" class="tree-dialog" top="5vh" :visible="approvalShow" v-loading="loading" v-dialogDrag :close-on-click-modal="false" @close="approvalCancel(0)">
      <div class="approver-edit" :style="{ overflow: approvalData.launchType == 2 && !approvalData.workflowNodeDTOS[1].prodSysRoleVo.selectedUserId ? 'hidden' : 'auto' }">
        <div class="begin-box">
          <div class="begin">
            <div class="circle"></div>
          </div>
          <div class="begin-text wh-100" style="">审批人员</div>
        </div>
        <div class="node-box">
          <div v-for="(item, index) in approvalData.workflowNodeDTOS" :key="index" v-show="item.nodeType == 2" style="margin-top: 20px" class="node-box-item">
            <div class="node">
              <i class="el-icon-user-solid"></i>
              {{ item.nodeName }}
              <i class="el-icon-bottom node-icon"></i>
            </div>
            <el-select @change="selectedUserIdChange" :clearable="item.prodSysRoleVo.sysUserList.length != 0" :disabled="item.prodSysRoleVo.sysUserList.length == 0 || (approvalData.launchType == 2 && index == 1)" :class="{ 'background-red': item.prodSysRoleVo.sysUserList.length == 0 || (approvalData.launchType == 2 && index == 1 && !item.prodSysRoleVo.selectedUserId) }" v-model="item.prodSysRoleVo.selectedUserId" size="mini" class="wh-100 ml-20" v-if="item.nodeType == 2">
              <el-option v-for="items in item.prodSysRoleVo.sysUserList" :key="items.pkId" :label="items.userName" :value="items.pkId"></el-option>
              <el-option v-if="item.prodSysRoleVo.sysUserList.length == 0 || (approvalData.launchType == 2 && index == 1 && !item.prodSysRoleVo.selectedUserId)" label="未找到匹配人员" value=""></el-option>
            </el-select>
          </div>
        </div>
        <div class="begin-box finish-box">
          <div class="begin finish">
            <div class="circle"></div>
            <div class="finish-text">结束</div>
            <i class="el-icon-bottom finish-icon"></i>
          </div>
          <div class="begin-text wh-100"></div>
        </div>
        <div class="explain">
          <!-- 说明：如果企业设置了不可跳过节点，点击设置时，有未选择人员的节点或未找到匹配人员的节点，都提示“XXX（节点名称）未配置人员”。 -->
        </div>
        <div class="noAppMask" v-if="approvalData.launchType == 2 && !approvalData.workflowNodeDTOS[1].prodSysRoleVo.selectedUserId">此流程节点只能由【{{ approvalData.workflowNodeDTOS[1].prodSysRoleVo.roleName }}】发起</div>
      </div>
      <div slot="footer" v-if="!(approvalData.launchType == 2 && !approvalData.workflowNodeDTOS[1].prodSysRoleVo.selectedUserId)">
        <el-button size="mini" type="primary" class="el-button-primary" @click="approvalSet">设置</el-button>
        <el-button size="mini" @click="approvalCancel(0)">取 消</el-button>
      </div>
    </el-dialog>
    <chapterProcessApproval @init="searchPageDesign" :chaptersApprovalDialog.sync="chaptersApprovalDialog" :bizType="3" :bizId="bizId" :sealPersonStatus="sealPersonStatus"></chapterProcessApproval>
    <approveCodeDialog ref="approveCodeDialog" :approveCodeDialog.sync="approveCodeDialog" @closeLoading="closeLoading" :sign-date="signDate" @approveOk="approveOk" :biz-type="3" :siStatus="siStatus" @signature="signature" :signed="signed" :appCodeType="appCodeType" @getNew="getNew"/>
  </div>
</template>

<script>
import pdfPiev from "../../components/pdf-preview/pdf-preview.vue";
import COS from "cos-js-sdk-v5";
import pdf from "vue-pdf-signature";
import signBox from "./component/signBox.vue";
import approvalDialog from "./component/approvalDialog.vue";
import { CustomViewer } from "@/components/customBpmn";
import chapterProcess from "../../components/inChapter/chapterProcess.vue";
import chapterProcessApproval from "../../components/inChapter/chapterProcessApproval.vue";
import treeSelect from "../../components/proTreeSelect/treeSelect.vue";
import approveCodeDialog from "@/components/approveCodeDialog.vue";
export default {
  components: { pdfPiev, pdf, signBox, approvalDialog, chapterProcess, chapterProcessApproval, treeSelect, approveCodeDialog },
  computed: {
    user() {
      return JSON.parse(sessionStorage.getItem("user") || "{}");
    }
  },
  watch: {
    siStatus(val) {
      if (val) {
        this.signed = false;
      } else {
        this.signed = true;
      }
    }
  },
  data() {
    return {
      loading: false,
      options: [], // 项目下拉
      proOptions: [], // 标段下拉
      dialogProOptions: [], // 新增弹框标段下拉
      sendPeoOptions: [], // 新增弹框标段下拉
      changeTypeOptins: [], // 变更类型下拉
      changeStatsOptins: [], // 变更状态下拉
      inpData: {
        changesName: "", // 变更名称
        fkProjectId: "", // 项目ID
        fkBidProjectId: "", // 标段项目ID
        changesStatus: "", // 变更状态
        fkWorkflowTemplateId: "", // 变更类型
        createUserName: "", // 发起人
        createUser: "" // 发起人id
      }, // 搜索栏数据
      searchData: {}, // 查询分页时的数据
      tableData: [], // 列表数据
      page: {
        pageNum: 1,
        pageSize: 10
      }, // 列表分页数据
      total: 0, // 列表总数
      addTitle: "发起变更", // 新增，编辑弹框标题
      addDialog: false, // 新增，编辑弹框
      dialogType: 1,
      formData: {
        approver: "", // 当前审批人
        changesCode: "", // 变更编号
        changesCost: "", // 变更预估成本
        changesName: "", // 变更名称
        changesPlan: "", // 变更设计方案
        changesReason: "", // 变更设计原因
        changesStatus: 0, // 变更状态 0 保存草稿 1 保存并发起
        fileList: [], // 设计变更附件
        fkApproverId: "", // 当前审批人ID
        fkBidProjectId: "", // 标段项目ID
        fkProjectId: "", // 项目ID
        fkWorkflowTemplateId: "" // 变更类型
      }, // 新增/编辑弹框数据
      rules: {
        fkApproverId: [{ required: true, message: "请选择审批人", trigger: "blur" }],
        fkBidProjectId: [{ required: true, message: "请选择标段", trigger: "change" }],
        fkProjectId: [{ required: true, message: "请选择项目", trigger: "change" }],
        fkWorkflowTemplateId: [{ required: true, message: "请选择变更类型", trigger: "change" }],
        changesCode: [
          { required: true, message: "请输入变更编号", trigger: "blur" }
          // { min: 2, max: 25, message: "变更编号长度为2-25", trigger: "blur" }
        ],
        changesCost: [{ required: true, message: "请输入变更预估成本", trigger: "blur" }],
        changesName: [{ required: true, message: "请输入变更名称", trigger: "blur" }],
        changesPlan: [{ required: true, message: "请输入变更设计方案", trigger: "blur" }],
        changesReason: [{ required: true, message: "请输入变更设计原因", trigger: "blur" }]
      }, // 校验规则
      showData: {}, // 查看，审批，撤回弹框数据
      previewDialog: false, // 预览弹框
      previewType: 1, // 预览类型，1为work，excel；2为pdf，3为图片
      url: "", // 预览pdf的链接
      approvalTitle: "变更设计审核详情", // 审批，查看，撤回弹框标题
      approvalDialog: false, // 审批，查看，撤回弹框
      appDiaType: 1, // 1为查看 2为处理 3为撤回 4为盖章查看
      activeName: "1",
      accessoryList: [], // 审批弹框附件列表
      approvalRecord: [], // 审批记录
      show: false, // 审批底部展示
      appFileList: [], // 审批人上传的附件列表
      launchDialog: false, // 发起签章弹框
      stampList: [], // 签章数据列表
      stampUnitList: [], // 签章单位列表
      stampPeoList: [], // 签章人列表
      sealerId: "", // 签章人id
      pdfUrl: "http://epms-1307524156.cos.ap-guangzhou.myqcloud.com/2022072909262962e33745848e53d3fe484199.pdf", // 发起签章，转交签署pdf
      pageTotalNum: 0, // pdf总页数
      pageNum: 1, // pdf当前页
      passDialog: false, // 转交签章弹框
      treeList: [], // 转交签章人员列表
      signatureDialog: false, // 签章弹框
      signatureUrl: "http://localhost:8080/#/production/setting", // 签章弹框url
      flowDialog: false, // 预览流程图弹框
      stateList: ["草稿", "审批中", "审批完成", "已驳回", "签章中", "签章已完成"],
      approvalOptions: [], // 负责人下拉
      bpmnImg: "", // bpmn流程图
      defaultProps: {
        label: "label",
        children: "children"
      },
      state: null, // 当前变更状态
      sealChangeId: "",
      tranForm: {
        changeId: "", // 设计变更主键
        prodUserId: "", // 签章人
        transCurrentNodeId: "" // 转交节点
      }, // 转交签章参数
      allowModify: 0,
      limitNum: 1000,
      typeCode: "",
      chapterDialog: false,
      bizId: "",
      delList: [], // 删除的附件集
      newAddList: [], // 本次操作新增的附件集
      approvalShow: false,
      approvalData: {
        workflowNodeDTOS: [
          {
            prodSysRoleVo: {
              sysUserList: []
            }
          }
        ]
      },
      approvalStatus: false,
      chaptersApprovalDialog: false,
      tableDTOS: [],
      timess: null,
      dis: false,
      sealPersonStatus: 0,
      typeShow: true,
      siStatus: false,
      approveCodeDialog: false,
      signDate: {
        fkNodeId: "",
        fkTemplateId: ""
      },
      signUrl: "",
      signed: false,
      appCodeType: 0,
      workflowNodeDTOS2: []
    };
  },
  created() {
    this.$api.getProjectTreeByOrgType().then(res => {
      if (res.code == 200) {
        if (res.data.length == 0 && [2, 3, 4, 9, 10, 11, 12].includes(this.user.orgType)) {
          return (this.typeShow = false);
        }
        if (this.user.orgType !== 5) {
          this.getAllProject();
        } else {
          this.searchPageDesign();
          this.getChangeType();
        }
        this.changeStatsQuery();
        this.getCreateUserList();
      } else {
        this.$message.error(res.msg);
      }
    });
  },
  methods: {
    getNew(){
      this.getSign()
    },
    approvalCancel(num) {
      if (num == 1 && this.approvalShow == true) {
        this.approvalShow = false;
      }
      if (num == 0 && this.approvalShow == true) {
        this.approvalShow = false;
        this.approvalData.workflowNodeDTOS = this.workflowNodeDTOS2;
      }
    },
    // 点击打开设置审批人 以及解决取消时 数据保存 错误问题
    setWorldata() {
      this.approvalShow = true;
      this.workflowNodeDTOS2 = JSON.parse(JSON.stringify(this.approvalData.workflowNodeDTOS)); // 用于临时保存克隆数据
    },
    approveOk(unique) {
      this.btnOk(1, unique);
    },
    async signerClick() {
      await this.$refs.addform2.validate();
      if (!this.approvalStatus) {
        return this.$message.warning("请设置审批人");
      }
      let NodeArr = this.approvalData.workflowNodeDTOS.filter(item => item.nodeType == 2);
      if (this.approvalData.launchType == 2 && !NodeArr[0].prodSysRoleVo.selectedUserId) {
        return this.$message.warning("首个节点必须有人");
      }

      this.$refs.approveCodeDialog.getApproveStatus(true);
    },
    checkCode() {
      if (!this.approvalStatus) {
        return this.$message.warning("请设置审批人");
      }
      let NodeArr = this.approvalData.workflowNodeDTOS.filter(item => item.nodeType == 2);
      if (this.approvalData.launchType == 2 && !NodeArr[0].prodSysRoleVo.selectedUserId) {
        return this.$message.warning("首个节点必须有人");
      }
      if (this.approvalData.launchType == 2) {
        this.$refs.approveCodeDialog.getApproveStatus();
      } else {
        this.btnOk(1);
      }
    },
    closeLoading() {
      this.loading = false;
    },
    signature(res) {
      // data.workflowTableList
      console.log("ddddddddddddd");
      console.log(res);
      console.log("ddddddddddddd");
      this.tableDTOS.forEach(item => {
        if (item.tableHtml != undefined && item.tableHtml != null && item.tableHtml.length != 0) {
          item.isModified = "0";
          item.tableHtml.forEach(e => {
            e.arr.forEach(i => {
              if (i.attributeTypes == 3) {
                if ([this.approvalData.workflowNodeDTOS[1].fkRoleId, this.approvalData.workflowNodeDTOS[1].sysRoleId].includes(i.signatureDate.signer)) {
                  i.signatureDate.img = res.data.url;
                  item.isModified = "1";
                }
              }
            });
          });
        }
      });
      this.signUrl = res.data.url;
      this.siStatus = false;
    },
    getSign() {
      this.siStatus = false;
      this.signed=false
      this.$api.getApproveStatus().then(res => {
        this.appCodeType = res.data;
        if (res.data == 2 || res.data == 3) {
          this.siStatus = true;
          this.tableDTOS.forEach(item => {
            if (item.tableHtml != undefined && item.tableHtml != null && item.tableHtml.length != 0) {
              item.tableHtml.forEach(e => {
                e.arr.forEach(i => {
                  if (i.attributeTypes == 3) {
                    if ([this.approvalData.workflowNodeDTOS[1].fkRoleId, this.approvalData.workflowNodeDTOS[1].sysRoleId].includes(i.signatureDate.signer)) {
                      i.signatureDate.img = "";
                    }
                  }
                });
              });
            }
          });
        }
      });
    },
    selectIds(arr, obj, isTrue) {
      console.log("获取到的", arr, obj);
      if (arr.length) {
        if (arr.length > 1) {
          this.inpData.fkProjectId = arr[0];
          this.inpData.fkBidProjectId = arr[1];
        } else {
          this.inpData.fkBidProjectId = arr[0];
        }
        // alert("1111111")
        if (isTrue) {
          // alert("22222")
          this.btnSearch();
        }
        this.inpData.fkWorkflowTemplateId = "";
        this.getChangeType(obj.fkOrgId);
      }
    },
    pageTime(boo) {
      clearInterval(this.timess);
      if (boo) {
        this.timess = setInterval(() => {
          if (this.tableData.filter(item => item.changesStatusStr == "数据处理中").length) {
            this.searchPageDesign();
          } else {
            clearInterval(this.timess);
          }
        }, 3000);
      }
    },
    getDesignWorkflowTable() {
      const data = {
        workflowId: this.formData.fkWorkflowTemplateId,
        changeId: this.formData.pkId
      };
      this.$api.getDesignWorkflowTable(data).then(res => {
        if (res.code === 200) {
          this.tableDTOS = res.data ? res.data : [];
          if (this.tableDTOS) {
            this.tableDTOS.forEach(item => {
              item.tableHtml = this.utils.unzip(item.tableHtml);
              if (item.tableHtml instanceof Array) {
              } else {
                item.tableHtml = JSON.parse(item.tableHtml);
              }
            });
            if (this.approvalData.launchType == 2) {
              this.getSign();
            } else {
              this.siStatus = false;
            }
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    revocation(row) {
      this.appDiaType = 6;
      this.getDesignDetail(row.pkId, 2, 2);
      // this.$confirm("确定撤回该用章审批流程?", "提示", {
      //   confirmButtonText: "确定",
      //   cancelButtonText: "取消",
      //   type: "warning"
      // }).then(() => {
      //   const pkId = row.pkId;
      //   this.$api.revocationWithdrawSeal({ pkId }).then(res => {
      //     if (res.code == 200) {
      //       this.$message.success("撤回成功");
      //       this.searchPageDesign();
      //     } else {
      //       this.$message.warning(res.msg);
      //     }
      //   });
      // });
    },
    sealApproveStatus(row) {
      this.sealPersonStatus = row.sealPersonStatus;
      this.chaptersApprovalDialog = true;
      this.bizId = row.sealPkId;
    },
    approvalSet() {
      let nodeArr = this.approvalData.workflowNodeDTOS.filter(item => item.nodeType == 2);
      if (this.approvalData.launchType == 2 && !nodeArr[0].prodSysRoleVo.selectedUserId) {
        return this.$message.warning("首个节点必须有人");
      }
      const arr = this.approvalData.workflowNodeDTOS;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].nodeType == 2) {
          if (arr[i].prodSysRoleVo && !!arr[i].prodSysRoleVo.selectedUserId) {
            this.approvalStatus = true;
            this.approvalCancel(1);
            return;
          } else {
            this.approvalStatus = false;
           this.approvalCancel(1);
          }
        }
      }
    },
    selectedUserIdChange() {
      // this.approvalStatus = true;
    },
    getApprover(data) {
      this.$api.getApprover({ ...data, projectId: this.formData.fkBidProjectId }).then(res => {
        if (res.code == 200) {
          if (!res.data) {
            this.approvalData = {
              workflowNodeDTOS: [
                {
                  prodSysRoleVo: {
                    sysUserList: []
                  }
                }
              ]
            };
            return;
          }
          res.data.workflowNodeDTOS.forEach((item, index) => {
            if (item.nodeType == 2) {
              item.prodSysRoleVo = item.prodSysRoleVo == null ? { selectedUserId: "", sysUserList: [] } : item.prodSysRoleVo;
              if (res.data.launchType == 2 && index == 1) {
                let arr = item.prodSysRoleVo.sysUserList.filter(item => item.pkId == this.user.pkId);
                item.prodSysRoleVo.selectedUserId = arr.length ? this.user.pkId : "";
                this.signDate = {
                  fkNodeId: item.pkId,
                  fkTemplateId: item.fkWorkflowTemplateId
                };
              } else {
                item.prodSysRoleVo.selectedUserId = item.prodSysRoleVo.selectedUserId == null ? "" : item.prodSysRoleVo.selectedUserId;
              }
              // item.prodSysRoleVo.selectedUserId = item.prodSysRoleVo.selectedUserId == null ? "" : item.prodSysRoleVo.selectedUserId;
            }
          });
          this.approvalData = res.data;
          this.getDesignWorkflowTable();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    chapterClick(row) {
      this.bizId = row.pkId;
      this.chapterDialog = true;
    },
    // 获取所有项目部
    getAllProject() {
      this.$api.getAllProjectInfo().then(res => {
        if (res.code === 200) {
          this.options = res.data;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取标段项目
    allListBidByProId(isWhole, projectId = "", type) {
      this.$api.allListBidByProId({ isWhole, projectId }).then(res => {
        if (res.code === 200) {
          if (type === 1) {
            this.proOptions = res.data;
          } else {
            this.dialogProOptions = res.data;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 发起人下拉
    getCreateUserList() {
      this.$api.getCreateUserList().then(res => {
        if (res.code === 200) {
          this.sendPeoOptions = res.data.map(item => ({ ...item, value: item.userId, label: item.userName }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 查询变更类型
    getChangeType(id) {
      const data = {};
      if (this.user.orgType != 5) {
        data.fkOrgId = id;
      }
      this.$api.getChangeType(data).then(res => {
        if (res.code === 200) {
          // console.log("xxxxxxxxxxxxxxxx111111xxxxxxxxxxxxxxxx")
          // console.log(res.data)
          // console.log("xxxxxxxxxxxxxxxx111111xxxxxxxxxxxxxxxx")
          this.changeTypeOptins = res.data.map(item => ({ ...item, value: item.key, label: item.name }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 查询变更状态
    changeStatsQuery() {
      this.$api.changeStatsQuery().then(res => {
        if (res.code === 200) {
          this.changeStatsOptins = res.data.map(item => ({ ...item, value: item.name, label: item.key }));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 分页列表
    searchPageDesign() {
      this.$api.searchPageDesign({ ...this.page, ...this.searchData }).then(res => {
        console.log("分页", res);
        if (res.code === 200) {
          this.tableData = res.data.records;
          this.total = res.data.total - 0;
          this.pageTime(true);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 选择项目部
    proChange(e, type) {
      if (type === 1) {
        this.inpData.fkBidProjectId = "";
      } else {
        this.formData.fkBidProjectId = "";
      }
      if (e) {
        this.allListBidByProId(0, e, type);
      }
    },
    // 查询下一节点负责人
    // findNextUser(workflowTemplateId, flowCaseId, currentNodeId) {
    //   let projectId = this.formData.fkBidProjectId;
    //   this.$api.findNextUser({ workflowTemplateId, flowCaseId, currentNodeId, projectId }).then(res => {
    //     console.log("负责人", res);
    //     if (res.code === 200) {
    //       this.approvalOptions = res.data.sysUserList ? res.data.sysUserList.map(item => ({ ...item, value: item.pkId, label: item.userName })) : [];
    //     } else {
    //       this.$message.warning(res.msg);
    //     }
    //   });
    // },

    typeChange(e) {
      // this.findNextUser(e);
      this.formData.fkApproverId = "";
      this.bpmnImg = this.changeTypeOptins.filter(item => item.value === e)[0].bpmnContent;
      console.log(e);
      this.getApprover({
        workflowId: e
      });
      this.dis = false;
      this.approvalStatus = false;
      // this.getDesignWorkflowTable();
      console.log("--------------------------");
      console.log(this.changeTypeOptins);
    },
    // 搜索按钮
    btnSearch() {
      this.page.pageNum = 1;
      this.searchData = { ...this.inpData };
      this.searchPageDesign();
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
    },
    // 根据id查询变更详情
    getDesignDetail(changeId, type, sendType) {
      this.loading = true;
      // type:1为编辑，2为打开审批弹框
      this.$api
        .getDesignDetail({ changeId, type: sendType })
        .then(res => {
          console.log("详情", res);
          if (res.code === 200) {
            this.formData = { ...this.formData, ...res.data, fileList: res.data.fileList ? res.data.fileList : [] };
            this.pdfUrl = res.data.templateUrl;
            this.typeCode = res.data.changesCode;
            if (type === 1) {
              // this.findNextUser(res.data.fkWorkflowTemplateId);
              this.user.orgType !== 5 && this.allListBidByProId(0, res.data.fkProjectId, 2);
              this.getApprover({ workflowId: this.formData.fkWorkflowTemplateId, pkId: res.data.pkId });
              this.addDialog = true;
              this.approvalStatus = !res.data.settingApproveFlag;
              this.$nextTick(() => {
                const arr = this.changeTypeOptins.filter(item => res.data.fkWorkflowTemplateId === item.value);
                if (!arr.length) {
                  this.approvalStatus = false;
                  this.formData.fkWorkflowTemplateId = res.data.fkWorkflowTemplateName;
                  this.dis = true;
                  setTimeout(() => {
                    this.$message.warning("该设计变更模板已取消或删除，请重新选择");
                  }, 300);
                }
              });
              // this.tableDTOS = res.data.workflowTableList ? res.data.workflowTableList : [];
              // console.log(res.data.workflowTableList);
              // if (this.tableDTOS) {
              //   this.tableDTOS.forEach(item => {
              //     item.tableHtml = this.utils.unzip(item.tableHtml);
              //     if (item.tableHtml instanceof Array) {
              //     } else {
              //       item.tableHtml = JSON.parse(item.tableHtml);
              //     }
              //   });
              // }
            } else {
              this.showData = res.data;
              this.approvalDialog = true;
            }
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 删除按钮
    handelDel(row) {
      console.log(row);
      const changeId = row.pkId;
      this.$confirm("确定删除该变更请求?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$api.deleteDesign({ changeId }).then(res => {
          if (res.code === 200) {
            this.btnSearch();
            this.$message.success("删除成功");
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    // 下载合同
    downloadContract(row) {
      this.$confirm("确定下载合同?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      }).then(() => {
        const exit = row.templateUrl.substring(row.templateUrl.lastIndexOf(".") + 1);
        if (exit == "pdf" || exit == "html") {
          this.fileLinkToStreamDownload(row.templateUrl, "合同", exit);
        } else {
          window.open(row.templateUrl);
        }
      });
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
    // 新增，编辑弹框
    openAddDialog(type, row) {
      this.dialogType = type;
      if (type === 1) {
        this.addTitle = "发起变更";
        this.addDialog = true;
        this.getBusinessCode();
        // this.approvalStatus = false;
      } else {
        this.addTitle = "编辑变更";
        // this.approvalStatus = true;
        this.formData.fkApproverId = row.fkApproverId;
        // this.findNextUser(row.fkWorkflowTemplateId);
        this.getDesignDetail(row.pkId, 1, 2);
      }
    },
    getBusinessCode() {
      this.$api.getBusinessCode({ businessType: 1 }).then(res => {
        if (res.code == 200) {
          this.allowModify = res.data.allowModify;
          console.log(!!res.data.allowModify);
          this.limitNum = res.data.limitNum;
          this.typeCode = res.data.typeCode;
          this.formData.changesCode = res.data.typeCode;
        }
      });
    },
    addDialogClose(isDel) {
      if (this.user.orgType !== 5) {
        this.$refs.addform1.resetFields();
      }
      this.$refs.addform2.resetFields();
      this.addDialog = false;
      this.dis = false;
      if (!isDel) {
        this.delList = [];
        this.delFiles();
      } else {
        this.newAddList = [];
        this.delFiles();
      }
      this.siStatus = false;
      this.signed=false
      this.formData = {
        approver: "", // 当前审批人
        changesCode: "", // 变更编号
        changesCost: "", // 变更预估成本
        changesName: "", // 变更名称
        changesPlan: "", // 变更设计方案
        changesReason: "", // 变更设计原因
        changesStatus: 0, // 变更状态 0 保存草稿 1 保存并发起
        fileList: [], // 设计变更附件
        fkApproverId: "", // 当前审批人ID
        fkBidProjectId: "", // 标段项目ID
        fkProjectId: "", // 项目ID
        fkWorkflowTemplateId: "" // 变更类型
      };
      this.signUrl = "";
      this.activeName = "1";
      this.allowModify = 0;
      this.limitNum = 1000;
    },
    // 新增弹框发起/保存
    async btnOk(changesStatus, unique) {
      if (this.user.orgType !== 5) {
        await this.$refs.addform1.validate();
      }
      await this.$refs.addform2.validate();
      // let approver = this.approvalOptions.filter(item => item.pkId === this.formData.fkApproverId)[0].userName;
      if (!this.approvalStatus) {
        return this.$message.warning("请设置审批人");
      }
      const data = { ...this.formData, changesStatus };
      if (!data.fkProjectId) {
        if ([4, 5].includes(this.user.orgType)) {
          delete data.fkProjectId;
        }
      }
      if (!data.fkBidProjectId && this.user.orgType === 5) {
        data.fkBidProjectId = "0";
      }
      this.loading = true;
      if (data.changesCode == this.typeCode) {
        data.isUpdate = 0;
      } else {
        data.isUpdate = 1;
      }
      data.prodWorkflowUserAdds = [];
      this.approvalData.workflowNodeDTOS.forEach(item => {
        if (item.nodeType == 2) {
          data.prodWorkflowUserAdds.push({
            bizType: 3,
            fkRoleId: item.fkRoleId,
            currentNodeId: item.pkId,
            fkApproverId: item.prodSysRoleVo.selectedUserId
          });
        }
      });
      if (this.approvalData.launchType == 2 && !data.prodWorkflowUserAdds[0].fkApproverId) {
        this.loading = false;
        return this.$message("首个节点必须有人");
      }
      const tableData = this.tableDTOS.length ? JSON.parse(JSON.stringify(this.tableDTOS)) : [];
      if (tableData.length) {
        tableData.forEach((item, idx) => {
          if (item.tableHtml.length == 0 || item.tableHtml == null) {
            this.$message.warning("表格数据为空 请检查表格数据是否正常");
            return (this.loading = false);
          }
          item.tableHtml = JSON.stringify(item.tableHtml);
          item.tableHtml = this.utils.zip(JSON.stringify(item.tableHtml));
        });
      }
      data.workflowTableList = tableData;
      data.signUrl = this.signUrl;
      if (unique) {
        data.unique = unique;
      }
      if (this.dialogType === 1) {
        this.$api
          .addDesign(data)
          .then(res => {
            if (res.code === 200) {
              this.$message.success("新增成功");
              this.addDialogClose(true);
              this.searchPageDesign();
            } else {
              this.$message.warning(res.msg);
            }
            this.loading = false;
          })
          .catch(err => {
            this.loading = false;
          });
      } else {
        this.$api
          .updateDesign(data)
          .then(res => {
            if (res.code === 200) {
              this.$message.success("编辑成功");
              this.addDialogClose(true);
              this.searchPageDesign();
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
    delFiles() {
      let urls = [];
      if (this.dialogType === 1) {
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
    // 查看，审批，撤回弹框
    openApprovalDialog(type, row) {
      this.appDiaType = type;
      this.state = row.changesStatus;
      this.pdfUrl = row.templateUrl;
      this.getDesignDetail(row.pkId, 2, type == 2 ? 2 : 1);
    },
    approvalDialogClose() {
      this.approvalDialog = false;
      this.pdfUrl = "";
      this.formData = {
        approver: "", // 当前审批人
        changesCode: "", // 变更编号
        changesCost: "", // 变更预估成本
        changesName: "", // 变更名称
        changesPlan: "", // 变更设计方案
        changesReason: "", // 变更设计原因
        changesStatus: 0, // 变更状态 0 保存草稿 1 保存并发起
        fileList: [], // 设计变更附件
        fkApproverId: "", // 当前审批人ID
        fkBidProjectId: "", // 标段项目ID
        fkProjectId: "", // 项目ID
        fkWorkflowTemplateId: "" // 变更类型
      };
      this.showData = {};
    },
    // 附件列表选择
    handleSelectionChange(val) {
      console.log(val);
    },
    // 发起签章弹框
    openLaunchDialog(row) {
      this.pageNum = 1;
      this.sealChangeId = row.pkId;
      this.pdfUrl = row.templateUrl;
      if (this.user.orgType === 5) {
        this.$api.validateBeforeGetSealPerson().then(res => {
          if (res.code === 200) {
            if (res.data) {
              this.getSealPerson(1);
              this.getContractCustom(row.pkId);
            } else {
              this.$message.warning("施工单位未企业认证，无法发起签章");
            }
          } else {
            this.$message.warning(res.msg);
          }
        });
      } else {
        this.getSealPerson(1);
        this.getContractCustom(row.pkId);
      }
    },
    // 签章人改变事件
    sealerChange(val) {
      console.log(val);
    },
    // 删除盖章
    closeSign(row, idx) {
      console.log(row);
      this.stampList.splice(idx, 1);
    },
    // 获取定位
    getPosition(e, row) {
      row.xcoordinate = e.x;
      row.ycoordinate = e.y;
    },
    // 申请人盖章
    firstParty() {
      this.stampList.push({ fkContractId: this.stampUnitList[0].contractId, id: Date.now(), page: this.pageNum, ycoordinate: 0, xcoordinate: 0, content: "申请人盖章" });
      this.firstPartyStatus = true;
    },
    // 审批人盖章
    quoteBquote(item, idx) {
      this.stampList.push({ fkContractId: item.contractId, id: Date.now(), page: this.pageNum, ycoordinate: 0, xcoordinate: 0, content: item.orgName + "盖章" });
    },
    // 获取签章人列表
    getSealPerson(type) {
      this.$api.getSealPerson().then(res => {
        if (res.code === 200) {
          if (type === 1) {
            let arr = [];
            res.data &&
              res.data.forEach(item => {
                arr = [...arr, ...item.prodUserVoList];
              });
            this.stampPeoList = arr.length ? arr.map(item => ({ ...item, value: item.pkId, label: item.userName })) : [];
          } else {
            this.treeList = res.data.map(item => ({ ...item, label: item.deptName, pkId: Math.random() * 100, children: item.prodUserVoList.map(item2 => ({ ...item2, label: item2.userName })) }));
            this.passDialog = true;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 查询签署区
    getContractCustom(changeId) {
      this.$api.getContractCustom({ changeId }).then(res => {
        console.log(res);
        if (res.code === 200) {
          this.stampUnitList = res.data;
          this.launchDialog = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 发起签章
    startSeal() {
      const prodChangesTemplateCustomAddList = this.stampList.map(item => ({ page: item.page, fkContractId: item.fkContractId, xcoordinate: item.xcoordinate / 0.8 + 50, ycoordinate: (673.6 - item.ycoordinate) / 0.8 - 50 }));
      const data = { changeId: this.sealChangeId, prodChangesTemplateCustomAddList, signUserId: this.sealerId };
      this.loading = true;
      this.$api
        .startSeal(data)
        .then(res => {
          if (res.code === 200) {
            this.$message.success("操作成功");
            this.closeLaunchDialog();
            this.searchPageDesign();
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    closeLaunchDialog() {
      this.launchDialog = false;
      this.stampList = [];
      this.sealChangeId = "";
      this.sealerId = "";
    },
    // 转交签章弹框
    openPassDialog(row) {
      this.pageNum = 1;
      this.tranForm.changeId = row.pkId;
      this.tranForm.transCurrentNodeId = row.transCurrentNodeId;
      this.pdfUrl = row.templateUrl;
      this.getSealPerson(2);
    },
    deliver() {
      this.tranForm.prodUserId = this.$refs.tree.getCheckedKeys()[0];
      console.log(this.tranForm);
      this.$api.transSeal(this.tranForm).then(res => {
        if (res.code === 200) {
          this.closePassDialog();
          this.searchPageDesign();
          this.$message.success("转交成功");
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closePassDialog() {
      this.$refs.tree.setCheckedNodes([]);
      this.passDialog = false;
      this.tranForm = {
        changeId: "", // 设计变更主键
        prodUserId: "", // 签章人
        transCurrentNodeId: "" // 转交节点
      };
    },
    // 签章弹框
    openSignatureDialog(row) {
      this.$api.findSealDetail({ pkId: row.sealPkId }).then(res => {
        if (res.code === 200) {
          this.signatureUrl = res.data;
          this.signatureDialog = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeSignatureDialog() {
      this.signatureDialog = false;
      this.searchPageDesign();
    },
    // 流程图弹框
    openFlowDialog() {
      if (!this.formData.fkWorkflowTemplateId) {
        return this.$message.warning("请先选择变更类型");
      }
      this.flowDialog = true;
      this.$nextTick(() => {
        this.init("preCan");
      });
      // this.inEstimate(this.formData.fkWorkflowTemplateId);
    },
    // pageSize改变
    handleSizeChange(val) {
      this.page.pageSize = val;
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      this.searchPageDesign();
    },
    // current改变
    handleCurrentChange(val) {
      this.page.pageNum = val;
      this.$refs.tables.bodyWrapper.scrollTo(0, 0);
      this.searchPageDesign();
    },
    // 触发上传input框
    uploading() {
      this.$refs.files.click();
    },
    // 删除附件
    removefile(row, idx) {
      this.delList.push(row.fileUrl);
      this.formData.fileList.splice(idx, 1);
    },
    // 获取签名
    upLoads(sign, folder, file, filename, tmpSecretKey, tmpSecretId, startTime, expiredTime) {
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
            // ExpiredTime: 1646819905,
            ScopeLimit: true
          });
        },
        // 可选参数
        FileParallelLimit: 3000, // 控制文件上传并发数
        ChunkParallelLimit: 3000, // 控制单个文件下分片上传并发数
        ProgressInterval: 1000 // 控制上传的 onProgress 回调的间隔
      });
      const index = filename.lastIndexOf(".");
      const name = filename.substring(index + 1, filename.length);
      const _this = this;
      cos.uploadFile(
        {
          Bucket: bucket,
          Region: region,
          Key: _this.uploadDate.objectKey + "." + name,
          Body: file,
          onProgress: function(progressData) {
            console.log(JSON.stringify(progressData));
          }
        },
        function(err, data) {
          if (data.statusCode == 200) {
            const path = "https://" + data.Location;
            _this.newAddList.push(path);
            if (_this.addDialog) {
              _this.formData.fileList.push({ fileName: _this.$refs.files.files[0].name, fileUrl: path });
            } else if (_this.approvalDialog) {
              _this.appFileList.push({ name: _this.$refs.files.files[0].name, path });
            }
            _this.loading = false;
            _this.$message({
              type: "success",
              message: "上传成功"
            });
            _this.$refs.files.value = "";
          } else {
            _this.loading = false;
            _this.$message({
              type: "error",
              message: "上传失败"
            });
          }
        }
      );
    },
    upLoad() {
      const fileObj = document.getElementById("upload").files[0];
      console.log(document.getElementById("upload").files);
      const blobFile = this.$options.methods.dataURLtoBlob.bind(this)(fileObj);
      const filename = fileObj.name;
      if (fileObj.size <= 0) {
        return this.$message.warning("文件大小不能为0kb");
      }
      if (fileObj.size > 5242880) {
        this.$refs.files.value = "";
        return this.$message.warning("文件大小不能超过5M");
      }
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
            this.$options.methods.upLoads.bind(this)(sign, path, blobFile, filename, res.data.tmpSecretKey, res.data.tmpSecretId, res.data.startTime, res.data.expiredTime);
          } else {
            console.log("res", res);
            this.loading = false;
            this.$message({
              type: "error",
              message: res.msg
            });
          }
        })
        .catch(err => {
          console.error(err);
          this.loading = false;
        });
    },
    // 上传腾讯云
    uploadFile(sign, folder, file, filename) {
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
            // StartTime: 1646818105, // 时间戳，单位秒，如：1580000000
            ExpiredTime: startTime, // 时间戳，单位秒，如：1580000900
            // ExpiredTime: 1646819905,startTime
            ScopeLimit: true
          });
        },
        // 可选参数
        FileParallelLimit: 3000, // 控制文件上传并发数
        ChunkParallelLimit: 3000, // 控制单个文件下分片上传并发数
        ProgressInterval: 1000 // 控制上传的 onProgress 回调的间隔
      });
    },
    // DataURL转Blob
    dataURLtoBlob(fileObj) {
      return new Blob([fileObj], { type: fileObj.type });
    },
    // 预览
    preview(url) {
      console.log(url);
      if (!url) {
        return this.$message.warning("无法识别的文件");
      }
      const exit = url.substring(url.lastIndexOf(".") + 1);
      const imgList = ["png", "jpg", "jpeg"];
      const orderList = ["docx", "xlsx"];
      this.url = url;
      if (exit === "pdf") {
        this.$refs.pdfPiev.pdfShow = true;
      } else if (imgList.includes(exit)) {
        this.previewType = 3;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      } else if (orderList.includes(exit)) {
        this.previewType = 1;
        this.previewDialog = true;
        this.$nextTick(() => {
          this.$refs.previewHeight.scrollTo(0, 0);
        });
      } else {
        this.$message.warning("该文件无法预览");
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
    // 上一页
    prePage() {
      let page = this.pageNum;
      page = page > 1 ? page - 1 : this.pageTotalNum;
      if (page == this.pageTotalNum) {
        return;
      }
      this.pageNum = page;
      // this.$refs.pdfWrap.scrollTo(0, 0);
    },
    // 下一页
    nextPage() {
      let page = this.pageNum;
      page = page < this.pageTotalNum ? page + 1 : 1;
      console;
      if (page == 1) {
        return;
      }
      this.pageNum = page;
      // this.$refs.pdfWrap.scrollTo(0, 0);
    },
    // 获取PDF总页数
    getNumPages(url) {
      const loadingTask = pdf.createLoadingTask(url);
      console.log("测试", url);
      loadingTask.promise
        .then(pdf => {
          this.pageTotalNum = pdf.numPages;
        })
        .catch(err => {
          this.$message.warning("pdf 加载失败", err);
        });
    },
    // 树形选中事件
    treeCheckClick(data, checked) {
      if (checked) {
        this.$refs.tree.setCheckedNodes([data]);
      }
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
          this.$message.warning("获取流程图失败");
        } else {
          // 这里是成功之后的回调, 可以在这里做一系列事情
          // this.bpmnModeler.get("canvas").zoom("fit-viewport", "auto");
          document.querySelector(".bjs-powered-by").style = "display:none";
        }
      });
    },
    // 自定义表格方法
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
      let nokong =val.trim()
      let nokong2 =item.arr[id].name.trim()
      if(nokong2 == nokong){
        return
      }
      item.arr[id].name = val;
      e.target.innerText = item.arr[id].name;
      if (i.disabled) {
        // let data = JSON.parse(sessionStorage.getItem("user"))
        i.id = this.user.pkId;
      }
      if (!nokong) {
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
.table-data {
  height: 80%;
}

td {
  border: 1px solid #000;
  padding: 10px 0;
}

.header-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  padding: 0 10px;
  margin-bottom: 5px;

  .myform {
    align-items: center;
    margin-top: 20px;
  }

  .search {
    margin-top: 6px;
  }
}

.wh-87per {
  width: 87%;
}

.priviewFlow {
  cursor: pointer;
  color: #1f83ff;
}

.dialog-bottom {
  display: flex;
}

.fileList {
  display: flex;

  .fileList-item {
    display: flex;
    align-items: center;
    margin-right: 10px;

    .fileName {
      cursor: pointer;
      max-width: 120px;
      overflow: hidden;
      white-space: nowrap;
      /*禁⽌换⾏*/
      text-overflow: ellipsis;
      /*省略号*/
    }

    .delFile {
      cursor: pointer;
      color: red;
      margin-left: 8px;
    }
  }
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
    // max-height: 610px;
  }
}

.table-height {
  overflow: auto;
}

.appDialog {
  height: 600px;
  overflow: hidden;

  /deep/ .el-textarea__inner {
    border: 0;
    height: 95px;
  }

  .appDialog-bottom {
    width: 100%;
    height: 200px;

    .appDialog-bottom-head {
      position: relative;
      display: flex;
      align-items: center;
      height: 40px;
      font-size: 16px;
      color: #fff;
      background-color: #02a7f0;

      div {
        padding-left: 30px;
      }

      .show {
        cursor: pointer;
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        width: 40px;
        height: 20px;
        line-height: 20px;
        padding-left: 0;
        text-align: center;
        background-color: #c5c3c3c2;
      }
    }

    .appDialog-bottom-main {
      display: flex;

      .appFile,
      .appOpinion {
        height: 100px;
        border: 1px solid #ccc;
      }

      .appFile {
        display: flex;

        .uploadBtn {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          width: 80px;
          cursor: pointer;

          .icons {
            font-size: 40px;
            color: #1296db;
          }
        }
      }
    }

    .appDialog-bottom-bottom {
      display: flex;
      height: 40px;
      border: 1px solid #ccc;
      border-top: 0;

      .left {
        width: 180px;
        height: 40px;
        text-align: center;
        line-height: 40px;
        color: #fff;
        background-color: #02a7f0;
      }

      .right {
        flex: 1;
        padding-left: 10px;
      }
    }
  }
}

.h-350 {
  height: 350px;
  transition: 0.5s;
}

.h-500 {
  height: 503px;
  transition: 0.5s;
}

.fx-1 {
  flex: 1;
}

.fx-2 {
  flex: 2;
}

.bd-r {
  border-right: 1px solid #ccc;
}

.mt-10 {
  margin-top: 10px;
}

.appFileList {
  flex: 1;
  overflow: auto;
  flex-wrap: wrap;

  .fileList-item {
    vertical-align: bottom;
    margin: 10px;
  }

  .fileIcon {
    font-size: 28px;
  }
}

.select-download {
  margin-top: 20px;
}

.show-tow {
  width: 100%;
  margin: 10px 0 15px;
  display: flex;
  justify-content: space-between;

  .left {
    flex: 1;
    position: relative;

    /deep/ .el-form-item {
      margin: 0;
    }

    .custom-field {
      .custom-field-from {
        height: 260px;
        overflow: auto;
      }

      ::-webkit-scrollbar {
        width: 5px;
        color: #fff;
        background-color: #fcfcfc;
      }

      ::-webkit-scrollbar-thumb {
        background-color: rgb(209, 209, 209);
      }
    }

    .launchDialog-btns {
      position: absolute;
      width: 100%;
      bottom: 0;
      text-align: center;
    }
  }

  .right {
    position: relative;

    // width: 500px;
    // height: 705px;
    .right-box {
      width: 100%;
      height: 100%;
      margin-bottom: 10px;
      overflow: hidden;
      // border: 1px solid !important;
    }

    .right-btn {
      position: absolute;
      top: 5px;
      right: 7px;
      z-index: 3;
    }
  }
}

.appSealer {
  margin: 20px 0 10px;
}

.approvers {
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
  width: 95%;
  height: 300px;

  .approvers-item {
    margin-right: 20px;
    margin-bottom: 20px;
  }
}

.explain {
  margin-top: 10px;
}
.noAppMask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffffce;
  font-size: 26px;
  font-weight: 700;
}
.passDialog {
  display: flex;

  .passDialog-left {
    flex: 1;
    position: relative;

    .tree {
      overflow: auto;
      width: 420px;
      height: 550px;
      margin-top: 20px;
      border: 1px solid #000;

      /deep/ .el-tree {
        width: 100%;
        height: 100%;
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
      }
    }

    .passDialog-btns {
      position: absolute;
      width: 100%;
      bottom: 10px;
      text-align: center;
    }
  }

  .passDialog-right {
    cursor: pointer;
    position: relative;
    width: 476px;
    height: 673.6px;
    margin-bottom: 10px;
    border: 1px solid;
  }
}

.flow {
  width: 95%;
  height: 600px;
  text-align: center;
  overflow: hidden;

  .pre-can {
    height: 100%;
  }
}

.approver-edit {
  height: 500px;
  overflow: auto;
  padding: 20px;
  position: relative;
  .begin-box {
    text-align: center;

    .begin {
      display: inline-block;
      width: 120px;
      text-align: center;

      .circle {
        width: 30px;
        height: 30px;
        border: 1px solid;
        border-radius: 15px;
        display: inline-block;
        vertical-align: middle;
      }
    }

    .begin-text {
      display: inline-block;
      margin-left: 20px;
      line-height: 30px;
    }
  }

  .finish-box {
    margin-top: 20px;

    .finish {
      position: relative;
      .circle {
        background-color: #606266;
      }

      .finish-text {
        position: absolute;
        right: 0px;
        top: 18%;
      }
      .finish-icon {
        position: absolute;
        left: 42%;
        top: -20px;
        font-size: 20px;
      }
    }
  }

  .node-box {
    text-align: center;
    .node-box-item {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .node {
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid;
      width: 120px;
      min-height: 60px;
      // line-height: 60px;
      // display: inline-block;
      border-radius: 6px;
      position: relative;

      .node-icon {
        font-size: 20px;
        position: absolute;
        top: -20px;
        left: 43%;
      }
    }
  }
  .explain {
    position: absolute;
    left: 50px;
    top: 20%;
    width: 200px;
    color: red;
  }
}

.ml-20 {
  margin-left: 20px;
}
.background-red {
  /deep/ .el-input__inner {
    padding: 0;
    background-color: #f4b4bc !important;
  }
}
.tab-box {
  position: relative;
  // height: 300px;
  overflow: auto;

  .text-html {
    input {
      // background-color: red;
      text-align: center;
    }
  }

  .mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
.h-480 {
  height: 480px;
}
.loaders {
  width: 25px;
  height: 25px;
}
</style>
