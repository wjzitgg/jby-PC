<template>
  <div>
    <el-header class="bar">
      <div class="logo-title">
        <img style="width: 50px;height: 50px; display: inline-block;" :src="user.orgLogo" alt="" />
        <h3 class="box-administration">{{ user.systemName }}</h3>
      </div>
      <div class="user-name" @mouseenter="show = true" @mouseleave="show = false">
        <img class="user-img" src="@/assets/index_icon_monitor.png" alt="" />
        <img class="user-img" src="@/assets/index_icon_help.png" alt="" />
        <div class="user">
          <span class="user-size">{{ timeOfDay + "," }}</span> &nbsp;&nbsp; <span class="user-size">{{ user.userName }}</span>
          <div class="user-xian"></div>
          <div class="head-img">
            <img :src="headImg" alt="" />
          </div>
          <ul class="user-set">
            <li @click="handleUserInfo">个人信息</li>
            <li @click="openCompanyDialog" v-if="enterpriseStatus">
              企业信息
              <span v-show="![5, 10, 11, 12].includes(user.orgType)" v-if="realNameVerify == 1">(已实名)</span>
              <span v-show="![5, 10, 11, 12].includes(user.orgType)" v-else>(未实名)</span>
            </li>
            <li @click="getOrgSealState" v-if="eSignedPoStatus">E签宝管理</li>
            <!-- <li @click="phoneDialog = true">手机号码修改</li> -->
            <!-- <li @click="passwordDialog = true">密码修改</li> -->
            <!-- <li @click="openCompanyDialog">企业信息</li> -->
            <li @click="openCenterDialog" v-if="this.userList.length > 1">切换账号</li>
          </ul>
        </div>

        <div class="log-out" @click="logOut">
          <i class="iconfont icontuichudenglu"></i>
          <!-- <span>退出登录</span> -->
        </div>
      </div>
    </el-header>
    <!-- 个人信息模态框 -->
    <el-dialog :close-on-press-escape="false" width="1000px" class="footer-right" title="个人信息" :visible="userInfoDialog" @close="closeUserInfoDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="userInfoDialog">
        <div class="userInfoDialog-avg">
          <div class="big-avg">
            <img :src="userInfo.isDefaultPortraitUrl == 0 ? user.defaultPortraitUrl : userInfo.url" alt="" />
          </div>
          <div class="sel-avg">
            <div class="sel-avg-item">
              <div :class="{ sel: userInfo.isDefaultPortraitUrl == 0 }" @click="selAvatar(0)">
                <div class="imgs">
                  <img :src="user.defaultPortraitUrl" alt="" />
                </div>
              </div>
              <div>默认头像</div>
            </div>
            <div class="sel-avg-item" v-if="userInfo.url">
              <div :class="{ sel: userInfo.isDefaultPortraitUrl == 1 }" @click="selAvatar(1)">
                <div class="imgs">
                  <img :src="userInfo.url" alt="" />
                </div>
              </div>
              <div class="upload-again" @click="uploadAva">重新上传</div>
            </div>
            <div class="sel-avg-item" v-else @click="uploadAva">
              <div>
                <div class="imgs uploads">
                  <i class="el-icon-camera"></i>
                </div>
              </div>
              <div class="upload-again">上传头像</div>
            </div>
          </div>
        </div>
        <div class="userInfoDialog-info">
          <el-form label-width="80px" :rules="userInfoRules" ref="userInfoForm" :model="userInfo">
            <el-form-item label="手机号码">
              <el-input :value="user.telephone" disabled suffix-icon="el-icon-lock"></el-input>
              <el-button type="text" size="mini" @click="changePhone">修改</el-button>
            </el-form-item>
            <el-form-item label="姓名" prop="realName">
              <el-input v-model="userInfo.realName" disabled suffix-icon="el-icon-lock"></el-input>
              <el-button type="text" size="mini" @click="realNameClick">查看实名信息</el-button>
            </el-form-item>
            <el-form-item label="昵称" prop="userName">
              <el-input v-model="userInfo.userName" maxlength="25"></el-input>
            </el-form-item>
            <el-form-item label="所属企业">
              <el-input :value="user.orgName" disabled suffix-icon="el-icon-lock"></el-input>
            </el-form-item>
            <el-form-item label="企业类型">
              <el-input :value="orgList[user.orgType]" disabled suffix-icon="el-icon-lock"></el-input>
            </el-form-item>
            <el-form-item label="所属部门" v-if="user.isMaster != 1">
              <el-input :value="user.deptName" disabled suffix-icon="el-icon-lock"></el-input>
            </el-form-item>
            <el-form-item label="所属角色" v-if="user.isMaster != 1">
              <el-input :value="user.roleName" disabled suffix-icon="el-icon-lock"></el-input>
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="userInfo.remark" :maxlength="100"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="userInfoDialog = false">取 消</el-button>
        <el-button class="" type="primary" @click="updateUserInfo">保存</el-button>
      </span>
    </el-dialog>
    <!-- 修改个人实名信息 -->
    <el-dialog :close-on-press-escape="false" title="修改实名信息" width="30%" :visible="phoneDialog" center v-dialogDrag :close-on-click-modal="false" :show-close="false" v-loading="loading">
      <el-form label-width="120px" :rules="newPhoneRules" ref="newPhoneForm" :model="newPhoneData">
        <el-form-item label="个人姓名" label-width="140px" width="">
          <el-input v-model="newPhoneData.handledRealName" :disabled="realNameStatus" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="个人证件类型" label-width="140px" width="">
          <el-select v-model="newPhoneData.handledCertType" :disabled="realNameStatus" placeholder="请选择">
            <el-option label="中国大陆居民身份证" value="CRED_PSN_CH_IDCARD"></el-option>
            <el-option label="香港来往大陆通行证" value="CRED_PSN_CH_HONGKONG"></el-option>
            <el-option label="澳门来往大陆通行证" value="CRED_PSN_CH_MACAO"></el-option>
            <el-option label="台湾来往大陆通行证" value="CRED_PSN_CH_TWCARD"></el-option>
            <el-option label="护照" value="CRED_PSN_PASSPORT"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="个人证件号" label-width="140px" width="">
          <el-input v-model="newPhoneData.handledCardNum" :disabled="realNameStatus" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="个人手机号码" label-width="140px" width="">
          <el-input v-model="newPhoneData.handledTelephone" :maxlength="11" :disabled="realNameStatus" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="验证码" label-width="140px" width="" v-if="!realNameStatus">
          <el-input v-model="newPhoneData.code" :disabled="realNameStatus" maxlength="4" style="width:50%" autocomplete="off"></el-input>
          <el-button type="primary" @click="getCode" v-if="timerStatus">获取验证码</el-button>
          <el-button type="primary" v-else>{{ countDown }}秒后重试</el-button>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer" v-if="realNameStatus">
        <el-button type="primary" @click="realNameStatus = false">重新实名</el-button>
        <el-button @click="phoneDialog = false">取 消</el-button>
      </span>
      <span slot="footer" class="dialog-footer" v-else>
        <el-button type="primary" @click="updatePhone">开始认证</el-button>
        <el-button @click="realNameStatus = true">取 消</el-button>
      </span>
    </el-dialog>
    <!-- 修改密码模态框 -->
    <!-- <el-dialog :close-on-press-escape="false" title="修改密码" width="30%" :visible="passwordDialog" center @close="closePasswordDialog" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <el-form label-width="120px" :rules="newPasswordRules" ref="newPasswordForm" :model="newPasswordData">
        <el-form-item label="账号">
          <el-input size="mini" disabled :value="user.loginName"></el-input>
        </el-form-item>
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input size="mini" v-model="newPasswordData.oldPassword" type="text" class="no-autofill-pwd"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input size="mini" v-model="newPasswordData.newPassword" type="text" class="no-autofill-pwd"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="secondPassword">
          <el-input size="mini" v-model="newPasswordData.sedcondPassword" type="text" class="no-autofill-pwd"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="updatePassword">保存</el-button>
        <el-button @click="closePasswordDialog">取 消</el-button>
      </span>
    </el-dialog> -->
    <!-- 公司信息修改模态框 -->
    <el-dialog :close-on-press-escape="false" title="公司信息修改" width="30%" :visible="companyInfoDialog" center @close="closeCompanyInfos" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <el-form label-width="120px" ref="companyInfoForm" :rules="newCompanyRules" :model="updateCompanyInfo" style="margin-right:50px;position: relative;">
        <el-form-item label="企业名称" prop="orgName">
          <div class="orgNameInput">
            <div class="inputs">
              <el-input size="mini" v-model.trim="updateCompanyInfo.orgName" maxlength="50"> </el-input>
            </div>
            <div class="orgTypes">{{ orgList[user.orgType] }}</div>
          </div>
        </el-form-item>
        <el-form-item label="实名信息" v-if="![5, 10, 11, 12].includes(user.orgType)">
          <el-input size="mini" v-model="updateCompanyInfo.orgRealName" disabled>
            <span slot="suffix" style="color:red" v-if="userOrgType.orgType != 5"><span v-if="realNameVerify == 1">已实名</span><span v-else>未实名</span></span>
          </el-input>
          <el-button style="position: absolute;top: 5px;right: -40px;" v-if="userOrgType.orgType != 5" type="primary" size="mini" @click="enterpriseInformation">{{ auTonYmBtn }}</el-button>
        </el-form-item>
        <el-form-item label="联系电话" prop="linkPhone">
          <el-input size="mini" v-model="updateCompanyInfo.linkPhone" type="number" oninput="if(value.length>11)value=value.slice(0, 11)" />
        </el-form-item>
        <el-form-item label="联系人" prop="linkMan">
          <el-input size="mini" v-model="updateCompanyInfo.linkMan" maxlength="20"></el-input>
        </el-form-item>
        <el-form-item label="公司规模">
          <el-select size="mini" v-model="updateCompanyInfo.orgScale">
            <el-option :value="0" label="20人以下" />
            <el-option :value="1" label="20~99人" />
            <el-option :value="2" label="100~499" />
            <el-option :value="3" label="500~999人" />
            <el-option :value="4" label="1000~4999人" />
            <el-option :value="5" label="5000~9999人" />
            <el-option :value="6" label="10000人以上" />
          </el-select>
        </el-form-item>
        <el-form-item label="到期时间">
          <el-input size="mini" v-model="updateCompanyInfo.expireTime" disabled></el-input>
        </el-form-item>
      </el-form>
      <div style="display:flex" v-if="user.orgType == 5">
        <div class="orgInfo">
          <div class="orgInfo-title">施工单位</div>
          <el-form label-width="80px">
            <el-form-item label="公司名称">
              <el-input size="mini" v-model="updateCompanyInfo.parentOrgName" disabled style="width:97%"></el-input>
            </el-form-item>
            <el-row>
              <el-col :span="12">
                <el-form-item label="联系人">
                  <el-input size="mini" v-model="updateCompanyInfo.parentLinkMan" disabled style="width:100%"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话">
                  <el-input size="mini" v-model="updateCompanyInfo.parentLinkPhone" disabled style="width:90%"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="updateCompanyInfos">保存</el-button>
        <el-button @click="closeCompanyInfos">取 消</el-button>
      </span>
    </el-dialog>
    <!-- 验证码模态框 -->
    <el-dialog :close-on-press-escape="false" :visible="popup" center top="30vh" title="请完成下列验证!" width="24%" @close="closePop" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <!-- <div class="codep">
        <img :src="imgCode" class="spacing" />
        <el-input v-model="phonemsgData.code" placeholder="请输入图形验证码"></el-input>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="getImgecode">切换验证码</el-button>
        <el-button type="success" @click="getNote">获取短信验证码</el-button>
      </div> -->
      <div class="dialog-form" style="padding-bottom:20px">
        <Slider style="margin: 0 auto;" v-if="imgCodeStatus" :imgurl="imgCode.img" :miniimgurl="imgCode.smallImage" :h="imgCode.oriImageHeight" :errShow="errShow" :w="imgCode.oriImageWidth" :sw="imgCode.slidingWidth" :sh="imgCode.slidingHeight" :sliderText="imgCode.captchaType" :blocky="imgCode.yHeight" @getNote="getNote" :code="imgCode.xWidth" @refresh="refresh" />
      </div>
    </el-dialog>
    <!--企业认证验证-->
    <el-dialog :close-on-press-escape="false" class="edit-box edit-enterprise" title="企业与经办人实名认证" :visible.sync="enterpriseShow" width="40%" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <!-- <div class="close-program">
        <el-button icon="el-icon-close" style="border: none;" @click="closeProgram"></el-button>
      </div> -->
      <div style="padding:20px">
        <el-form :model="enterpriseForm" ref="enterpriseForm">
          <el-form-item label="组织机构名称" prop="name" label-width="140px">
            <el-input size="mini" v-model.trim="enterpriseForm.orgName" :disabled="(realNameVerify == 1 && auTonYmBtn != '查看实名信息') || editComType" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="组织机构证件类型" prop="certType" label-width="140px">
            <el-select size="mini" v-model="enterpriseForm.certType" :disabled="realNameVerify == 1 || auTonYmBtn == '查看实名信息' || editComType" placeholder="请选择">
              <el-option label="统一社会信用代码" value="CRED_ORG_USCC"></el-option>
              <el-option label="工商注册号" value="CRED_ORG_REGCODE"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="组织机构证件号" prop="name" label-width="140px">
            <el-input size="mini" v-model.trim="enterpriseForm.certNo" :disabled="realNameVerify == 1 || auTonYmBtn == '查看实名信息' || editComType" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="组织机构类型" prop="organizationType" label-width="140px">
            <el-select size="mini" v-model="enterpriseForm.organizationType" :disabled="realNameVerify == 1 || auTonYmBtn == '查看实名信息' || editComType" placeholder="请选择">
              <el-option label="企业类" value="1"></el-option>
              <el-option label="个体工商户" value="2"></el-option>
              <el-option label="其他组织" value="99"></el-option>
            </el-select>
          </el-form-item>
          <el-radio-group v-model="enterpriseFormRadio" size="mini">
            <el-radio-button label="1" v-if="!editComType || (editComType && enterpriseForm.legalRepType == 0)">法人</el-radio-button>
            <el-radio-button label="2" v-if="!editComType || (editComType && enterpriseForm.legalRepType == 1)">经办人</el-radio-button>
          </el-radio-group>
          <div style="border: 1px solid #f3f3f3;">
            <el-form-item v-if="enterpriseFormRadio == 1" label="法定代表人姓名" prop="legalRepName" label-width="140px">
              <el-input size="mini" v-model.trim="enterpriseForm.legalRepName" :disabled="(realNameVerify == 1 && auTonYmBtn != '查看实名信息') || editComType" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item v-if="enterpriseFormRadio == 1" label="法定代表人证件类型" prop="legalRepCertType" label-width="140px">
              <el-select size="mini" v-model="enterpriseForm.legalRepCertType" :disabled="(realNameVerify == 1 && auTonYmBtn != '查看实名信息') || editComType" placeholder="请选择">
                <el-option label="中国大陆居民身份证" value="CRED_PSN_CH_IDCARD"></el-option>
                <el-option label="香港来往大陆通行证" value="CRED_PSN_CH_HONGKONG"></el-option>
                <el-option label="澳门来往大陆通行证" value="CRED_PSN_CH_MACAO"></el-option>
                <el-option label="台湾来往大陆通行证" value="CRED_PSN_CH_TWCARD"></el-option>
                <el-option label="护照" value="CRED_PSN_PASSPORT"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="enterpriseFormRadio == 1" label="法定代表人证件号" prop="legalRepCertNo" label-width="140px">
              <el-input size="mini" v-model.trim="enterpriseForm.legalRepCertNo" :disabled="(realNameVerify == 1 && auTonYmBtn != '查看实名信息') || editComType" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item v-if="enterpriseFormRadio == 1" label="法人手机号码" prop="account" label-width="140px">
              <el-input :disabled="(realNameVerify == 1 && auTonYmBtn != '查看实名信息') || editComType" oninput="if(value.length>11)value=value.slice(0, 11)" type="number" size="mini" v-model.trim="enterpriseForm.legalRepacCount" autocomplete="off"></el-input>
            </el-form-item>

            <el-form-item v-if="enterpriseFormRadio == 2" label="经办人姓名" prop="repName" label-width="140px">
              <el-input size="mini" :disabled="(realNameVerify == 1 && auTonYmBtn != '查看实名信息') || editComType" v-model.trim="enterpriseForm.operatorName" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item v-if="enterpriseFormRadio == 2" label="经办人证件类型" prop="legalRepCertType" label-width="140px">
              <el-select size="mini" :disabled="(realNameVerify == 1 && auTonYmBtn != '查看实名信息') || editComType" v-model="enterpriseForm.operatorCertType" placeholder="请选择">
                <el-option label="中国大陆居民身份证" value="CRED_PSN_CH_IDCARD"></el-option>
                <el-option label="香港来往大陆通行证" value="CRED_PSN_CH_HONGKONG"></el-option>
                <el-option label="澳门来往大陆通行证" value="CRED_PSN_CH_MACAO"></el-option>
                <el-option label="台湾来往大陆通行证" value="CRED_PSN_CH_TWCARD"></el-option>
                <el-option label="护照" value="CRED_PSN_PASSPORT"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item v-if="enterpriseFormRadio == 2" label="经办人证件号" prop="repCertNo" label-width="140px">
              <el-input size="mini" :disabled="(realNameVerify == 1 && auTonYmBtn != '查看实名信息') || editComType" v-model.trim="enterpriseForm.operatorCertNo" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item v-if="enterpriseFormRadio == 2" label="经办人手机号码" prop="account" label-width="140px">
              <el-input :disabled="(realNameVerify == 1 && auTonYmBtn != '查看实名信息') || editComType" @keydown.native="keyDown" oninput="if(value.length>11)value=value.slice(0, 11)" type="number" size="mini" v-model.trim="enterpriseForm.operatorMobile" autocomplete="off"></el-input>
            </el-form-item>
          </div>
        </el-form>
        <div style="text-align: center;margin-top:10px" v-if="(realNameVerify == 0 || auTonYmBtn == '查看实名信息') && !editComType">
          <el-button type="primary" @click="personalCertificates">开始认证</el-button>
          <!-- <el-button type="primary" @click="editComType = true">取消</el-button> -->
          <el-button type="primary" @click="enterpriseShow = false">取消</el-button>
        </div>
        <div style="text-align: center;margin-top:10px" v-if="realNameVerify == 1 && editComType">
          <el-button type="primary" @click="editComType = false">重新认证</el-button>
        </div>
      </div>
    </el-dialog>
    <!-- 二维码弹框 -->
    <el-dialog top="10vh" class="qr-title" width="30%" :visible="authenticationShow" title="实名验证" :close-on-click-modal="true" :close-on-press-escape="false" v-loading="loading" @close="codeClosure">
      <!-- <div class="close-qrcode">
        <el-button icon="el-icon-close" style="border: none;" @click="closeProgram"></el-button>
      </div> -->
      <p class="hint-tit">请使用系统APP或者微信扫一扫</p>
      <p>完成企业或个人实名认证</p>
      <!-- <div v-if="refreshCode"><el-button @click="refreshClick">刷新二维码</el-button></div> -->
      <div ref="qrCodes" id="qrCodes">
        <div class="codeTime" title="刷新二维码" v-if="refreshCode">
          <!-- <i :class="haha ? 'el-icon-refresh-left' : 'el-icon-loading'" @click="refreshClick"></i> -->
        </div>
      </div>
      <!--  -->
      <div class="codeOk" v-if="codeOk">
        <i class="el-icon-circle-check iconColor mb-20"></i>
        <div class="mb-60">扫描成功</div>
        <div>请在手机上根据提示操作</div>
        <el-button type="text" @click="refreshClick">重新加载二维码</el-button>
      </div>
    </el-dialog>
    <el-dialog width="80%" :visible="controlPanelShow" title="E签宝企业控制台" :close-on-click-modal="true" @close="closeTheConsole" :close-on-press-escape="false" v-loading="loading">
      <iframe :src="controlPanelUrl" height="680px" width="100%" name="demo" scrolling="auto" v-if="orgSealState == 1" sandbox="allow-same-origin allow-scripts"></iframe>
      <div class="h-680" v-else>
        <unnamed :type="orgSealState === 2 ? 2 : 1" @resh="getOrgSealState" :appendToBody="true" :ids="'e'"></unnamed>
      </div>
    </el-dialog>
    <!-- 多用户弹窗 -->
    <!-- <el-dialog title="选择单位" :visible.sync="centerDialogVisible" v-loading="loading2" :close-on-click-modal="false"
      :close-on-press-escape="false" :show-close="false" class="multi-account" width="30%" center>
      <div class="center centerDialog">
        <el-radio-group v-model="tabPosition" style="margin-bottom: 30px;">
          <el-radio-button class="radio-button" v-for="item in userList" :key="item.userId" :label="item.userId"
            :disabled="item.pastStatus == 0">{{ item.loginName }} <span v-if="item.isMaster == 1"
              class="violet">(管理员)</span></el-radio-button>
        </el-radio-group>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="multipleAccountSelection">确 定</el-button>
        <el-button type="info" @click="centerDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog> -->
    <el-dialog v-loading="loadings" :visible.sync="centerDialogVisible" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false" class="multi-account" width="600px" center>
      <!-- <div class="multi-account-title">选择账户</div> -->
      <div class="multi-account-title2 mt-20">当前选择</div>
      <div class="center centerDialog">
        <!-- 'pitch-on': tabPosition == item.userId, -->
        <div class="item-box " :class="{ bg1: [4, 10, 7, 8].includes(nowSelCon.orgType), bg2: [2, 3, 12, 6].includes(nowSelCon.orgType), bg3: [5, 9, 11].includes(nowSelCon.orgType), bg4: [0].includes(nowSelCon.orgType), bg5: [1].includes(nowSelCon.orgType), 'item-box-forbidden': nowSelCon.pastStatus == 0 || nowSelCon.pastStatus == 2 }" @click="itemClick(nowSelCon)">
          <el-row :span="24" style="width:100%">
            <el-col :span="4">
              <img v-if="nowSelCon.orgType == 0" class="head-portrait" src="@/assets/headPortrait/yy.png" />
              <img v-if="nowSelCon.orgType == 1" class="head-portrait" src="@/assets/headPortrait/dl.png" />
              <img v-if="nowSelCon.orgType == 2" class="head-portrait" src="@/assets/headPortrait/js.png" />
              <img v-if="nowSelCon.orgType == 3" class="head-portrait" src="@/assets/headPortrait/jl.png" />
              <img v-if="nowSelCon.orgType == 4" class="head-portrait filleted-corner" src="@/assets/headPortrait/sg.png" />
              <img v-if="nowSelCon.orgType == 5" class="head-portrait filleted-corner" src="@/assets/headPortrait/xm.png" />
              <img v-if="nowSelCon.orgType == 6" class="head-portrait filleted-corner" src="@/assets/headPortrait/gy.png" />
              <img v-if="nowSelCon.orgType == 7" class="head-portrait filleted-corner" src="@/assets/headPortrait/fb.png" />
              <img v-if="nowSelCon.orgType == 8" class="head-portrait filleted-corner" src="@/assets/headPortrait/lw.png" />
              <img v-if="nowSelCon.orgType == 9" class="head-portrait filleted-corner" src="@/assets/headPortrait/sj.png" />
              <img v-if="nowSelCon.orgType == 10" class="head-portrait filleted-corner" src="@/assets/headPortrait/sgjt.png" />
              <img v-if="nowSelCon.orgType == 11" class="head-portrait filleted-corner" src="@/assets/headPortrait/zfjg.png" />
              <img v-if="nowSelCon.orgType == 12" class="head-portrait filleted-corner" src="@/assets/headPortrait/jsjt.png" />
            </el-col>
            <el-col :span="20">
              <div class="item-box-title">{{ nowSelCon.orgName }}</div>
              <div class="df">
                <div class="loginName">{{ nowSelCon.loginName }}</div>
                <div v-if="nowSelCon.isMaster == 1" class="mange-user">
                  <div>管理员</div>
                </div>
                <div class="shabi el-icon-lock" v-if="nowSelCon.pastStatus == 0 || nowSelCon.pastStatus == 2"></div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      <div class="multi-account-title2">请选择</div>
      <div class="center centerDialog">
        <!-- 'pitch-on': tabPosition == item.userId, -->
        <div class="item-box " v-for="item in showUserList" :key="item.userId" :class="{ bg1: [4, 10, 7, 8].includes(item.orgType), bg2: [2, 3, 12, 6].includes(item.orgType), bg3: [5, 9, 11].includes(item.orgType), bg4: [0].includes(item.orgType), bg5: [1].includes(item.orgType), 'item-box-forbidden': item.pastStatus == 0 || item.pastStatus == 2 }" @click="itemClick(item)">
          <el-row :span="24" style="width:100%">
            <el-col :span="4">
              <img v-if="item.orgType == 0" class="head-portrait" src="@/assets/headPortrait/yy.png" />
              <img v-if="item.orgType == 1" class="head-portrait" src="@/assets/headPortrait/dl.png" />
              <img v-if="item.orgType == 2" class="head-portrait" src="@/assets/headPortrait/js.png" />
              <img v-if="item.orgType == 3" class="head-portrait" src="@/assets/headPortrait/jl.png" />
              <img v-if="item.orgType == 4" class="head-portrait filleted-corner" src="@/assets/headPortrait/sg.png" />
              <img v-if="item.orgType == 5" class="head-portrait filleted-corner" src="@/assets/headPortrait/xm.png" />
              <img v-if="item.orgType == 6" class="head-portrait filleted-corner" src="@/assets/headPortrait/gy.png" />
              <img v-if="item.orgType == 7" class="head-portrait filleted-corner" src="@/assets/headPortrait/fb.png" />
              <img v-if="item.orgType == 8" class="head-portrait filleted-corner" src="@/assets/headPortrait/lw.png" />
              <img v-if="item.orgType == 9" class="head-portrait filleted-corner" src="@/assets/headPortrait/sj.png" />
              <img v-if="item.orgType == 10" class="head-portrait filleted-corner" src="@/assets/headPortrait/sgjt.png" />
              <img v-if="item.orgType == 11" class="head-portrait filleted-corner" src="@/assets/headPortrait/zfjg.png" />
              <img v-if="item.orgType == 12" class="head-portrait filleted-corner" src="@/assets/headPortrait/jsjt.png" />
            </el-col>
            <el-col :span="20">
              <div class="item-box-title">{{ item.orgName }}</div>
              <div class="df">
                <div class="loginName">{{ item.loginName }}</div>
                <div v-if="item.isMaster == 1" class="mange-user">
                  <div>管理员</div>
                </div>
                <div class="shabi el-icon-lock" v-if="item.pastStatus == 0 || item.pastStatus == 2"></div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      <div style="height:84px"></div>
      <!-- <span slot="footer" class="dialog-footer flex">
        <div class="footerBrn mr-20 okBtn" @click="multipleAccountSelection" :disabled="btnDisable">确 定</div>
        <div class="footerBrn cancelBtn" @click="centerDialogVisible = false">取 消</div>
      </span> -->
    </el-dialog>
    <!-- 登录弹框 -->
    <loginDialog @getUserList="getLoginList(1)"></loginDialog>
    <!-- 修改手机号 -->
    <el-dialog title="修改手机号码" :visible="changePhoneDia" width="25%" top="5vh" @close="closePhoneDia" v-dialogDrag :close-on-click-modal="false" v-loading="loading">
      <div class="changePhoneDia">
        <el-form style="padding: 12px;" label-width="100px">
          <el-form-item label="旧手机号码">
            <el-input v-model="user.telephone" size="mini" disabled></el-input>
          </el-form-item>
          <el-form-item label="需迁移账号">
            <!-- <el-input v-model="form.sealName" size="mini" disabled></el-input> -->
            <div class="accList">
              <el-checkbox-group v-model="changeArr" @change="accChange">
                <el-checkbox :label="item.pkId" v-for="item in changePhoneUserList" :key="item.pkId" :disabled="(!user.isMaster && user.pkId == item.pkId) || !!item.authorizerStatus">{{ item.orgName + (item.authorizerStatus ? "(e签宝授权过期)" : "") }}</el-checkbox>
              </el-checkbox-group>
            </div>
          </el-form-item>
          <el-form-item label="新手机号码">
            <el-input :disabled="!changeArr.length" v-model.trim="newPhoneData.handledTelephone" @input="phoneChange" size="mini" :maxlength="11" oninput="if(value.length>11)value=value.slice(0, 11)" type="number"></el-input>
          </el-form-item>
          <el-form-item label="验证码" v-show="canChange">
            <el-input v-model="changePhoCode" maxlength="4" style="width:50%" autocomplete="off" size="mini"></el-input>
            <el-button type="primary" @click="getCode" v-if="timerStatus" size="mini">获取验证码</el-button>
            <el-button type="primary" v-else size="mini">{{ countDown }}秒后重试</el-button>
          </el-form-item>
        </el-form>
        <div class="errMsg" v-if="!canChange && !!errMsg">{{ errMsg }}</div>
      </div>
      <div slot="footer">
        <el-button type="primary" @click="changePhoneOk">保 存</el-button>
        <el-button @click="changePhoneDia = false">取 消</el-button>
      </div>
    </el-dialog>
    <codeDia :codeDia.sync="codeDia" @scanOk="scanOk" @reshCode="modifyTelephone" ref="codeDia" :userFaceDistinguishId="userFaceDistinguishId" :faceUrl="faceUrl"></codeDia>
    <cropImg :dialogVisible.sync="cropImgShow" :imgUrl="cropImgUrl" @getImgUrl="getImgUrl"></cropImg>
    <input type="file" ref="uploadInp" accept="image/jpg,image/jpeg,image/png" @change="uploadInp" v-if="userInfoDialog" style="position: relative; z-index: -1;" />
  </div>
</template>

<script>
import api from "@/api/api";
import QRCode from "qrcodejs2";
import unnamed from "../../../org/compoments/unnamed";
import loginDialog from "../../../../components/loginDialog/loginDialog.vue";
import Slider from "@/components/SlideVerify";
import codeDia from "./codeDia.vue";
import cropImg from "./cropImg.vue";
export default {
  name: "navBar",
  components: { unnamed, loginDialog, Slider, codeDia, cropImg },
  data() {
    // 验证密码二次输入是否一致
    const validatePass = (rule, value, callback) => {
      if (this.newPasswordData.newPassword === "") {
        callback(new Error("请再次输入密码"));
      } else if (this.newPasswordData.sedcondPassword !== this.newPasswordData.newPassword) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      // headImg: "",
      userInfoDialog: false,
      phoneDialog: false,
      passwordDialog: false,
      companyInfoDialog: false,
      editComType: false,
      popup: false,
      // 个人信息修改
      userInfo: {
        userName: "",
        remark: "",
        isDefaultPortraitUrl: 0,
        url: ""
      },

      // 手机号码修改
      // 图形验证码
      imgCode: "",
      // 修改个人实名信息
      newPhoneData: {
        // password: "",
        // phoneNumber: "",
        // code: ""
        handledCertType: "",
        handledRealName: "",
        handledCardNum: "",
        handledTelephone: "",
        code: ""
      },
      // 发送短信验证码数据
      phonemsgData: {
        code: "",
        phoneNumber: "",
        sendType: 2,
        uuid: ""
      },
      uuid: "",
      // 密码修改
      newPasswordData: {
        oldPassword: "",
        newPassword: "",
        sedcondPassword: ""
      },
      // 公司信息修改
      updateCompanyInfo: {
        linkMan: "",
        linkPhone: "",
        orgScale: 0,
        orgName: ""
      },

      // 校验规则
      userInfoRules: {
        userName: [{ required: true, message: "请输入新姓名", trigger: "blur" }]
      },
      newPhoneRules: {
        password: [
          {
            required: true,
            message: "请输入登录密码",
            trigger: "blur"
          }
        ],
        phoneNumber: [
          {
            required: true,
            message: "请输入新手机号码",
            trigger: ["blur"]
          },
          {
            pattern: /^1(3|4|5|6|7|8|9)\d{9}$/,
            message: "手机号格式错误",
            trigger: "blur"
          }
        ],
        code: [{ required: true, message: "请输入验证码", trigger: "blur" }]
      },
      newPasswordRules: {
        oldPassword: [{ required: true, message: "请输入旧密码", trigger: "blur" }],
        newPassword: [{ required: true, message: "请输入新密码", trigger: "blur" }],
        secondPassword: [{ validator: validatePass, trigger: "blur" }]
      },
      newCompanyRules: {
        orgName: [
          { required: true, message: "请输入企业名称", trigger: "blur" },
          { min: 2, max: 50, message: "企业名称的长度为2-50", trigger: "blur" }
        ],
        linkMan: [{ required: true, message: "请输入联系人", trigger: "blur" }],
        linkPhone: [
          { required: true, message: "请输入联系电话", trigger: "blur" },
          {
            pattern: /^1(3|4|5|6|7|8|9)\d{9}$/,
            message: "手机号格式错误",
            trigger: "blur"
          }
        ]
      },
      loading: false,
      // realNameVerify: "",
      realNameStatus: true,
      authenticationShow: false,
      refreshCode: false,
      codeOk: false,
      codeTimer: null,
      codeTimer2: null,
      unique: "",
      authenticationUrl: "",
      enterpriseShow: false,
      auTonYmBtn: "",
      enterpriseForm: {
        authType: "business",
        account: "",
        certNo: "",
        certType: "",
        name: "",
        legalRepCertNo: "",
        legalRepCertType: "",
        legalRepName: "",
        organizationType: "",
        distinguishType: "1",
        legalRepType: "",
        operatorCertNo: "",
        operatorCertType: "",
        operatorMobile: "",
        operatorName: "",
        orgName: ""
        // organizationType:""
      },
      enterpriseFormRadio: "1",
      controlPanelShow: false,
      controlPanelUrl: "",
      userOrgType: {
        orgType: ""
      },
      timeOfDay: "上午好", // 时间
      personageStatus: false,
      enterpriseStatus: false,
      eSignedPoStatus: false,
      centerDialogVisible: false,
      tabPosition: "",
      userList: [],
      loadings: false,
      loading2: false,
      timerStatus: true, // 验证码状态
      countDown: 60, // 倒计时
      btnDisable: false,
      authTimer: null,
      orgSealState: "",
      orgList: ["系统运营商", "系统代理商", "建设单位", "监理公司", "施工单位", "项目部", "供应商", "分包单位", "劳务工人", "设计院", "施工单位集团公司", "政府监管单位", "建设单位集团公司"],
      errShow: false,
      changePhoneDia: false,
      newPhone: "",
      codeShow: true,
      scanningState: false,
      changeArr: [],
      changePhoCode: "",
      changePhoneUserList: [],
      userFaceDistinguishId: "",
      faceUrl: "",
      timer: null,
      imgCode: {},
      imgCodeStatus: false,
      canChange: false,
      errMsg: "",
      validateCode: "",
      codeDia: false,
      nowSelCon: {
        orgType: 0
      },
      cropImgShow: false,
      cropImgUrl: "",
      avaList: []
    };
  },
  watch: {
    realNameStatus(val) {
      if (val == false) {
        this.getAuthInfo2();
      } else {
        this.realNameClick();
      }
    }
  },
  created() {
    // this.userList = localStorage.getItem("accountList") ? JSON.parse(localStorage.getItem("accountList")) : [];
    // console.log(this.userList);
    // this.getLoginList()
    this.getUserInfo();

    this.findDictAllList();
    // this.userOrgType = JSON.parse(sessionStorage.getItem("user"));

    // console.log("=====================")
    // console.log(sessionStorage.getItem("personalDetails"))
    // console.log(JSON.parse(sessionStorage.getItem("personalDetails"))
    // console.log( this.userOrgType.orgType )
    // console.log("=====================")
    let user = JSON.parse(sessionStorage.getItem("user"));
    console.log(this.user);
    // this.headImg = user.portraitUrl;
  },
  beforeDestroy() {
    clearInterval(this.timer);
    clearInterval(this.codeTimer);
    clearInterval(this.codeTimer2);
  },
  mounted() {
    this.getTimeOfDay();
    this.getAuthInfo();
    const personalDetails = JSON.parse(sessionStorage.getItem("personalDetails"));
    if (personalDetails == null) {
      return;
    }
    personalDetails.forEach(item => {
      if (item.name == "个人信息") {
        this.personageStatus = true;
      }
      if (item.name == "企业信息") {
        this.enterpriseStatus = true;
      }
      if (item.name == "e签宝管理") {
        this.eSignedPoStatus = true;
      }
    });
  },
  methods: {
    getImgUrl(url) {
      this.userInfo.url = url;
      this.avaList.push(url);
    },
    uploadInp() {
      const fileObj = this.$refs.uploadInp.files[0];
      console.log(fileObj);
      const reader = new FileReader();
      reader.readAsDataURL(fileObj);
      reader.onload = () => {
        // 图片在这里
        if (typeof reader.result === "string") {
          console.log(reader.result);
          this.cropImgUrl = reader.result;
          this.cropImgShow = true;
          this.$refs.uploadInp.value = "";
        }
      };
    },
    uploadAva() {
      this.$refs.uploadInp.click();
    },
    selAvatar(sel) {
      this.userInfo.isDefaultPortraitUrl = sel;
    },
    accChange() {
      if (!this.changeArr.length) {
        this.canChange = false;
        this.errMsg = "";
        this.changePhoCode = "";
        this.newPhoneData.handledTelephone = "";
      }
    },
    phoneChange() {
      const myreg = /^1(3|4|5|6|7|8|9)\d{9}$/;
      if (myreg.test(this.newPhoneData.handledTelephone)) {
        // this.getUrlByNewTelephone();
        this.validateModifyTelephone();
      } else {
        this.canChange = false;
        this.errMsg = "";
      }
    },
    validateModifyTelephone() {
      const data = {
        userIds: this.changeArr.join(","),
        telephone: this.newPhoneData.handledTelephone
      };
      this.$api.validateModifyTelephone(data).then(res => {
        if (res.code == 200) {
          this.canChange = true;
        } else {
          this.canChange = false;
          this.errMsg = res.msg;
        }
      });
    },
    closePhoneDia() {
      this.changePhoneDia = false;
      this.scanningState = false;
      this.codeShow = true;
      this.canChange = false;
      this.changePhoCode = "";
      this.changeArr = [];
      this.newPhoneData.handledTelephone = "";
    },
    changePhone() {
      this.$api.getChangePhoneUserList().then(res => {
        if (res.code === 200) {
          this.changePhoneUserList = res.data;
          if (!this.user.isMaster) {
            res.data.forEach(item => {
              if (!item.authorizerStatus && item.pkId == this.user.pkId) {
                this.changeArr = [this.user.pkId];
              }
            });
          }
          this.changePhoneDia = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    changePhoneOk() {
      const data = {
        telephone: this.newPhoneData.handledTelephone,
        userIds: this.changeArr,
        redirectUrl: "https://erp.jianwangkeji.cn/back.html",
        code: this.changePhoCode,
        uuid: this.uuid
      };
      console.log(data);
      if (!data.userIds.length) {
        return this.$message.warning("请选择账号");
      }
      const myreg = /^1(3|4|5|6|7|8|9)\d{9}$/;
      if (!myreg.test(data.telephone)) {
        return this.$message.warning("请输入正确手机号");
      }
      if (!data.uuid) {
        return this.$message.warning("请获取验证码");
      }
      if (!data.code) {
        return this.$message.warning("请输入验证码");
      }
      this.loading = true;
      this.$api.validateTelephoneIsAccess({ telephone: this.newPhoneData.handledTelephone, uuid: this.uuid, code: this.changePhoCode }).then(result => {
        if (result.code === 200) {
          this.validateCode = result.data;
          this.modifyTelephone();
        } else {
          this.$message.warning(result.msg);
          this.loading = false;
        }
      });
    },
    modifyTelephone() {
      const data = {
        telephone: this.newPhoneData.handledTelephone,
        userIds: this.changeArr,
        validateCode: this.validateCode,
        redirectUrl: "https://erp.jianwangkeji.cn/back.html"
      };
      this.$api
        .modifyTelephone(data)
        .then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.userFaceDistinguishId = res.data.userFaceDistinguishId;
            this.faceUrl = res.data.faceSwipingUrl;
            this.$refs.codeDia.getQrcode();
            // this.codeDia=true
            // this.$message.success("修改成功");
            // this.getUserInfo();
            // this.changePhoneDia = false;
          } else {
            this.$message.warning(res.msg);
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    scanOk() {
      this.$message.success("修改成功");
      if (this.user.isMaster) {
        this.changePhoneDia = false;
        this.getUserInfo();
      } else {
        this.logOut();
      }
    },
    /**
     * @param {*} getTimeOfDay 获取时间回对应问候语
     */
    getTimeOfDay() {
      const currentHour = new Date().getHours();
      if (currentHour >= 0 && currentHour < 12) {
        this.timeOfDay = "上午好";
      } else if (currentHour >= 12 && currentHour < 14) {
        this.timeOfDay = "中午好";
      } else if (currentHour >= 14 && currentHour < 18) {
        this.timeOfDay = "下午好";
      } else {
        this.timeOfDay = "晚上好";
      }
    },
    itemClick(item) {
      if (item.pastStatus == 0 || item.pastStatus == 2) {
        return;
      }
      this.tabPosition = item.userId;
      this.multipleAccountSelection();
    },
    // 获取手机验证码
    getCode() {
      // 校验手机号
      const myreg = /^1(3|4|5|6|7|8|9)\d{9}$/;
      if (!myreg.test(this.newPhoneData.handledTelephone)) {
        this.$message({ message: "请输入正确的手机号码", type: "error" });
        return;
      }
      this.newPhoneData.code = "";
      this.phonemsgData.code = "";
      this.phonemsgData.phoneNumber = this.newPhoneData.handledTelephone;
      this.getImgecode();
      this.popup = true; // 控制弹窗
    },
    getOrgSealState() {
      const api = this.user.orgType === 0 ? this.$api.getOrgSealState : this.$api.getOrgSealState2;
      api().then(res => {
        if (res.code === 200) {
          this.orgSealState = res.data;
          if (res.data == 1) {
            this.management();
          } else {
            this.controlPanelShow = true;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    closeTheConsole() {
      this.controlPanelShow = false;
      this.$api.closeTheConsole().then(res => {
        console.log("--------------------------");
        console.log(res);
        console.log("--------------------------");
      });
    },
    management() {
      this.loading = true;
      this.controlPanelShow = true;
      this.$api.closeTheConsole().then(res => {
        // console.log("--------------------------");
        // console.log(res);
        // console.log("--------------------------");
        this.$api
          .orgConsole()
          .then(res => {
            this.loading = false;
            if (res.code == 200) {
              this.controlPanelUrl = res.data;
            } else {
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            this.loading = false;
          });
      });
    },
    personalCertificates() {
      // return console.log(this.enterpriseForm.certType)
      // debugger
      if (this.enterpriseForm.orgName == undefined || this.enterpriseForm.orgName == null || this.enterpriseForm.orgName.length == 0) {
        return this.$message.warning("组织机构名称不能为空");
      }
      if (this.enterpriseForm.certType == undefined || this.enterpriseForm.certType == null || this.enterpriseForm.certType.length == 0) {
        return this.$message.warning("组织机构证件类型不能为空");
      }
      if (this.enterpriseForm.certNo == undefined || this.enterpriseForm.certNo == null || this.enterpriseForm.certNo.length == 0) {
        return this.$message.warning("组织机构证件号不能为空");
      }
      if (this.enterpriseForm.organizationType == undefined || this.enterpriseForm.organizationType == null || this.enterpriseForm.organizationType.length == 0) {
        return this.$message.warning("组织机构类型不能为空");
      }
      if (this.enterpriseFormRadio == 1 && (this.enterpriseForm.legalRepName == undefined || this.enterpriseForm.legalRepName == null || this.enterpriseForm.legalRepName.length == 0)) {
        return this.$message.warning("法定代表人姓名不能为空");
      }
      if (this.enterpriseFormRadio != 1 && (this.enterpriseForm.operatorName == undefined || this.enterpriseForm.operatorName == null || this.enterpriseForm.operatorName.length == 0)) {
        return this.$message.warning("经办人姓名不能为空");
      }
      if (this.enterpriseFormRadio == 1 && (this.enterpriseForm.legalRepCertType == undefined || this.enterpriseForm.legalRepCertType == null || this.enterpriseForm.legalRepCertType.length == 0)) {
        return this.$message.warning("法定代表人证件类型不能为空");
      }
      if (this.enterpriseFormRadio != 1 && (this.enterpriseForm.operatorCertType == undefined || this.enterpriseForm.operatorCertType == null || this.enterpriseForm.operatorCertType.length == 0)) {
        return this.$message.warning("经办人证件类型不能为空");
      }
      if (this.enterpriseFormRadio == 1 && (this.enterpriseForm.legalRepCertNo == undefined || this.enterpriseForm.legalRepCertNo == null || this.enterpriseForm.legalRepCertNo.length == 0)) {
        return this.$message.warning("法定代表人证件号不能为空");
      } else {
        if (this.enterpriseForm.legalRepCertType == "CRED_PSN_CH_IDCARD") {
          const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
          // 15位身份证号码校验正则
          const regs = /^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$/;
          if (reg.test(this.enterpriseForm.legalRepCertNo) || regs.test(this.enterpriseForm.legalRepCertNo)) {
          } else {
            return this.$message.warning("请输入正确的身份证号码");
          }
        }
      }
      if (this.enterpriseFormRadio != 1 && (this.enterpriseForm.operatorCertNo == undefined || this.enterpriseForm.operatorCertNo == null || this.enterpriseForm.operatorCertNo.length == 0)) {
        return this.$message.warning("经办人证件号不能为空");
      } else {
        if (this.enterpriseForm.operatorCertNo == "CRED_PSN_CH_IDCARD") {
          const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
          // 15位身份证号码校验正则
          const regs = /^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$/;
          if (reg.test(this.enterpriseForm.operatorCertNo) || regs.test(this.enterpriseForm.operatorCertNo)) {
          } else {
            return this.$message.warning("请输入正确的身份证号码");
          }
        }
      }
      if (this.enterpriseFormRadio == 1 && (this.enterpriseForm.legalRepacCount == undefined || this.enterpriseForm.legalRepacCount == null || this.enterpriseForm.legalRepacCount.length == 0)) {
        return this.$message.warning("法人手机号码不能为空");
      }
      if (this.enterpriseFormRadio != 1 && (this.enterpriseForm.operatorMobile == undefined || this.enterpriseForm.operatorMobile == null || this.enterpriseForm.operatorMobile.length == 0)) {
        return this.$message.warning("经办人手机号码不能为空");
      }
      this.enterpriseForm.name = this.enterpriseForm.orgName;
      if (this.enterpriseFormRadio == 1) {
        this.enterpriseForm.legalRepType = 0;
        this.enterpriseForm.account = this.enterpriseForm.legalRepacCount;
      } else {
        this.enterpriseForm.legalRepType = 1;
        this.enterpriseForm.account = this.enterpriseForm.operatorMobile;
      }
      const data = { ...this.enterpriseForm };
      // de this.distinguishType.distinguishType
      delete data.distinguishType;

      this.$api.faceSwiping(data).then(res => {
        if (res.code == 200) {
          this.countdownTime = res.data.countdownTime;
          // if (res.data.isSwiping == 0) {
          // this.hint = "完成企业或个人实名认证"; // 二维码提示是核身认证还是企业
          // this.authenticationShwo = true;

          this.authenticationUrl = res.data.faceSwipingUrl;
          this.authenticationShow = true;
          this.getQrCode();
          this.userFaceDistinguishId = res.data.userFaceDistinguishId;
          this.timerTask();
          // } else if (res.data.isSwiping == 2) {
          //   this.hint = "完成账号的核身认证"; // 二维码提示是核身认证还是企业
          //   // this.authenticationShwo = true;
          //   this.authenticationUrl = res.data.faceSwipingUrl;
          //   this.getQrcode();
          //   this.userFaceDistinguishId = res.data.userFaceDistinguishId;
          //   this.timerTask();
          // } else {
          //   this.$message.warning(res.msg);
          // }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // hsas() {
    //   // this.$nextTick(e => {
    //     this.getAuthInfo();
    //   //  },500)
    // },
    getAuthInfo() {
      this.$api.getAuthInfo({ type: 1 }).then(res => {
        console.log("xxxxxxxx111111111xxxxxxxxxxxxxx");
        console.log(res);
        console.log("xxxxxxxx111111111xxxxxxxxxxxxxx");
        if (res.code == 200) {
          if (res.data.authType == "business") {
            if (res.data.certNo == null || res.data.certNo == "") {
              // this.realNameVerify = 0;
              // sessionStorage.setItem("realNameVerify", 0);
              this.$store.commit("setRealNameVerify", "0");
            } else {
              // this.realNameVerify = 1;
              // sessionStorage.setItem("realNameVerify", 1);
              this.$store.commit("setRealNameVerify", "1");
            }
          } else {
            if (res.data.operatorMobile == null || (res.data.operatorMobile == "" && res.data.authType == "personal")) {
              // this.realNameVerify = 0;
              // sessionStorage.setItem("realNameVerify", 0);
              this.$store.commit("setRealNameVerify", "0");
            } else {
              // this.realNameVerify = 1;
              // sessionStorage.setItem("realNameVerify", 1);
              this.$store.commit("setRealNameVerify", "1");
            }
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    codeClosure() {
      clearInterval(this.timer);
      this.authenticationShow = false;
      this.codeOk = false;
      this.clearCodetime();
    },
    timerTask() {
      this.timer = setInterval(() => {
        this.$api
          .userFaceDistinguishState({ pkId: this.userFaceDistinguishId, distinguishType: 0 })
          .then(res => {
            if (res.code == 200) {
              this.stopTime = this.stopTime + 3;
              // if (this.stopTime == this.countdownTime) {
              //   this.stopTime = 0;
              //   this.countdownTime = "";
              //   this.refreshCode = true;
              // return clearInterval(this.timer);
              // }
              if (res.data.status == 2) {
                clearInterval(this.timer);
                this.getUserInfo();
                this.authenticationShow = false;
                this.userInfoDialog = false;
                this.companyInfoDialog = false;
                // this.authenticationShwo = false;
                // this.personalCertificateShow = false;
                // companyInfoDialog
                this.getAuthInfo();
                this.enterpriseShow = false;
                this.editComType = false;
                this.phoneDialog = false;
                this.$message.success("认证成功");

                //   this.$store.commit("statusAlter", true);
                //   sessionStorage.setItem("statusAlter", true);
              } else if (res.data.status == 3) {
                clearInterval(this.timer);
                this.$message.warning(res.data.errorInfo);
                this.authenticationShow = false;
                // this.refreshCode = true;
                // this.$message({
                //   message: "请重新刷新二维码重试",
                //   duration: 5000
                // });
              }
              // if (res.data == 3) {
              //   clearInterval(this.timer);
              //   this.refreshCode = true;
              //   this.$message({
              //     message: "请重新刷新二维码重试",
              //     duration: 5000
              //   });
              // }
            } else {
              clearInterval(this.timer);
              this.$message.warning(res.msg);
            }
          })
          .catch(err => {
            clearInterval(this.timer);
          });
      }, 3000);
    },
    getQrCode() {
      this.$nextTick(res => {
        this.$refs.qrCodes.innerHTML = "";
        const location = window.location.origin;
        this.$api.addQRCode().then(res => {
          if (res.code === 200) {
            this.unique = res.data;
            console.log("xxxxxxxxxxxxxxxxx");
            console.log(this.unique);
            console.log("xxxxxxxxxxxxxxxxx");

            const data = JSON.stringify(encodeURIComponent(this.authenticationUrl));
            new QRCode("qrCodes", {
              width: 260,
              height: 260,
              text: `${location}/h5/#/pages/h5/scanCodeTran?type=2&unique=${this.unique}&data=${data}`
            });
            this.queryQRCode();
          } else {
            this.$message.warning(res.msg);
          }
        });
      });
    },
    queryQRCode() {
      clearInterval(this.codeTimer);
      // const _this = this
      this.codeTimer = setInterval(() => {
        this.$api.queryQRCode({ unique: this.unique }).then(res => {
          if (res.code === 200) {
            if (res.data === 1) {
              clearInterval(this.codeTimer);
              this.codeOk = true;
            }
          } else {
            clearInterval(this.codeTimer);
          }
        });
      }, 5000);
      this.codeTimer2 = setTimeout(() => {
        clearInterval(this.codeTimer);
        this.codeOk = true;
      }, 1800000);
    },
    refreshClick() {
      this.codeOk = false;
      const dom = this.$refs.qrCode;
      this.getQrCode();
      dom.removeChild(dom.childNodes[1]);
      dom.removeChild(dom.childNodes[1]);
    },
    clearCodetime() {
      // 清除定时器
      clearInterval(this.codeTimer);
      this.codeTimer = null;
      this.codeTimer2 = null;
    },
    realNameClick() {
      this.$api.getAuthInfo({ type: 0 }).then(res => {
        if (res.code == 200) {
          this.newPhoneData.handledCardNum = res.data.operatorCertNo;
          this.newPhoneData.handledCertType = res.data.operatorCertType;
          this.newPhoneData.handledRealName = res.data.operatorName;
          this.newPhoneData.handledTelephone = res.data.operatorMobile;
          this.phoneDialog = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    getAuthInfo2() {
      this.$api.getAuthInfo({ type: 2 }).then(res => {
        if (res.code == 200) {
          this.newPhoneData.handledCardNum = res.data.operatorCertNo;
          this.newPhoneData.handledCertType = res.data.operatorCertType;
          this.newPhoneData.handledRealName = res.data.operatorName;
          this.newPhoneData.handledTelephone = res.data.operatorMobile;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    enterpriseInformation() {
      // if (this.realNameVerify == 1) {
      this.$api.getAuthInfo({ type: 1 }).then(res => {
        if (res.code == 200) {
          this.enterpriseForm = {
            authType: "business",
            legalRepacCount: res.data.legalRepacCount,
            certNo: res.data.certNo,
            certType: res.data.certType,
            orgName: res.data.orgName,
            legalRepCertNo: res.data.legalRepCertNo,
            legalRepCertType: res.data.legalRepCertType,
            legalRepName: res.data.legalRepName,
            organizationType: res.data.organizationType + "",
            distinguishType: "1",
            legalRepType: res.data.legalRepType,
            // legalRepType: "",
            operatorCertNo: res.data.operatorCertNo,
            operatorCertType: res.data.operatorCertType,
            operatorMobile: res.data.operatorMobile,
            operatorName: res.data.operatorName,
            orgName: res.data.orgName
          };
          if (res.data.certNo) {
            this.enterpriseFormRadio = res.data.legalRepType === 0 ? "1" : "2";
            this.editComType = true;
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
      // } else {
      //   this.enterpriseForm = {
      //     authType: "business",
      //     account: "",
      //     certNo: "",
      //     certType: "",
      //     orgName: "",
      //     legalRepCertNo: "",
      //     legalRepCertType: "",
      //     legalRepName: "",
      //     organizationType: "",
      //     distinguishType: "1",
      //     legalRepType: "",
      //     legalRepacCount:"",
      //     operatorCertNo:"",
      //     operatorCertType:"",
      //     operatorMobile:"",
      //     operatorName:"",
      //     orgName:"",
      //   };
      // }
      this.enterpriseShow = true;
    },
    // 退出登录
    logOut() {
      this.$emit("loadShow");
      this.$api.logout().then(res => {
        if (res.code === 200) {
          this.$router.push("/login");
          localStorage.removeItem("user");
          this.$store.commit("setTagsList", [{ path: "/home/home", title: "首页", name: "home" }]);
          this.$message.success("退出登录成功");
        } else {
          this.$emit("loadShow");
          this.loading = false;
          this.$message.warning(res.msg);
        }
      });
    },
    // 获取个人信息
    getUserInfo() {
      api.getPersonInfo().then(res => {
        if (res.code === 200) {
          console.log("个人信息", res.data);
          this.$store.commit("setUserinfo", res.data);
          this.$store.commit("setBtnPemission", res.data.permissions);
          localStorage.setItem("orgId", res.data.fkOrgId);
          localStorage.setItem("userId", JSON.stringify(res.data.pkId));
          this.userOrgType = res.data;
          this.getLoginList();

          if (![0].includes(res.data.orgType)) {
            this.searchMenuDataAuthorize();
          }
          // localStorage.setItem("btnPemission", JSON.stringify(res.data.permissions));
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 弹出个人信息模态框
    handleUserInfo() {
      console.log(this.user);
      this.userInfo = {
        userName: this.user.userName,
        realName: this.user.realName,
        remark: this.user.remark || "",
        isDefaultPortraitUrl: this.user.isDefaultPortraitUrl,
        url: this.user.portraitUrl
      };
      console.log(this.userInfo);
      this.userInfoDialog = true;
    },
    // 关闭个人信息模态框
    closeUserInfoDialog() {
      this.userInfoDialog = false;
      this.$refs.userInfoForm.clearValidate();
      this.userInfo = {
        userName: "",
        remark: "",
        isDefaultPortraitUrl: 0,
        url: ""
      };
      let urls = this.avaList;
      if (urls.length) {
        this.$api.delFiles({ urls: urls.join(",") });
        this.avaList = [];
      }
    },
    // 更新个人信息
    async updateUserInfo() {
      await this.$refs.userInfoForm.validate();
      this.loading = true;
      const data = {
        userName: this.userInfo.userName,
        remark: this.userInfo.remark,
        url: this.userInfo.isDefaultPortraitUrl == 0 ? this.user.defaultPortraitUrl : this.userInfo.url
      };
      let urls = this.avaList.filter(item => item != this.userInfo.url);
      if (urls.length) {
        this.$api.delFiles({ urls: urls.join(",") });
      }
      api
        .editPersonInfo(data)
        .then(res => {
          if (res.code === 200) {
            this.avaList = [];
            this.userInfoDialog = false;
            this.getUserInfo();
            this.$message.success("更新成功");
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    refresh() {
      this.getImgecode();
    },
    // 获取图形验证码
    async getImgecode() {
      this.imgCodeStatus = false;
      await this.$api
        .imgCode()
        .then(res => {
          if (res.code === 200) {
            this.imgCode = res.img;
            this.phonemsgData.uuid = res.uuid;
            this.imgCode = res;
            this.imgCodeStatus = true;
          } else {
            this.refresh();
            this.$message({ message: res.msg, type: "error" });
          }
        })
        .catch(err => {});
    },
    // 获取短信验证码
    getNote(val) {
      // if (!this.phonemsgData.code) {
      //   this.$message({ message: "请输入正确的图形验证码", type: "error" });
      //   return;
      // }
      this.phonemsgData.code = val;
      this.$api.mobileMsg(this.phonemsgData).then(res => {
        if (res.code === 200) {
          this.uuid = res.data;
          this.popup = false;
          this.$message({ message: "验证码发送成功", type: "success" });
          this.timerStatus = false;
          this.authTimer = setInterval(() => {
            this.countDown--;
            if (this.countDown <= 0) {
              this.timerStatus = true;
              this.countDown = 60;
              clearInterval(this.authTimer);
            }
          }, 1000);
        } else {
          this.getImgecode();
          this.errShow = true;
          setTimeout(() => {
            this.errShow = false;
          }, 3000);
          // this.$message({ message: res.msg, type: "error" });
        }
      });
    },

    // 关闭获取短信的弹窗
    closePop() {
      this.popup = false;
      this.newPhoneData.code = "";
      this.newPhoneData.uuid = "";
    },
    // 关闭修改手机号模态框
    closePhoneDialog() {
      // this.$refs.newPhoneForm.clearValidate();
      // this.newPhoneData = { password: "", phoneNumber: "", code: "" };
      this.phoneDialog = false;
      this.timerStatus = true;
      this.countDown = 60;
      clearInterval(this.authTimer);
    },
    // 手机号码修改
    async updatePhone() {
      if (this.newPhoneData.handledRealName.length == 0) {
        return this.$message.warning("个人姓名不能为空");
      }
      if (this.newPhoneData.handledTelephone.length == 0) {
        return this.$message.warning("手机号码不能为空");
      }
      if (this.newPhoneData.handledCertType.length == 0) {
        return this.$message.warning("个人认证类型不能为空");
      }
      if (this.newPhoneData.handledCardNum.length == 0) {
        return this.$message.warning("个人证件号不能为空");
      } else {
        if (this.newPhoneData.handledCertType == "CRED_PSN_CH_IDCARD") {
          const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
          // 15位身份证号码校验正则
          const regs = /^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$/;
          if (reg.test(this.newPhoneData.handledCardNum) || regs.test(this.newPhoneData.handledCardNum)) {
          } else {
            // callback('请输入正确的身份证号码')
            return this.$message.warning("请输入正确的身份证号码");
          }
        }
      }
      const data = {
        authType: "personal",
        certNo: this.newPhoneData.handledCardNum,
        certType: this.newPhoneData.handledCertType,
        // distinguishType: 1,
        name: this.newPhoneData.handledRealName,
        account: this.newPhoneData.handledTelephone,
        phoneNum: this.user.telephone,
        uuid: this.uuid,
        code: this.newPhoneData.code
      };
      // distinguishType
      this.$api.faceSwiping(data).then(res => {
        // console.log(res);
        if (res.code == 200) {
          this.authenticationUrl = res.data.faceSwipingUrl;
          this.userFaceDistinguishId = res.data.userFaceDistinguishId;
          this.authenticationShow = true;
          this.getQrCode();
          this.timerTask();
        } else {
          this.$message.warning(res.msg);
        }
      });
      // let data = { ...this.newPhoneData, uuid: this.uuid };
      // await this.$refs.newPhoneForm.validate();
      // this.loading = true;
      // api
      //   .editPhone(data)
      //   .then(res => {
      //     if (res.code === 200) {
      //       this.$message.success(res.msg);
      //       this.closePhoneDialog();
      //     } else {
      //       this.$message.warning(res.msg);
      //     }
      //     this.loading = false;
      //   })
      //   .catch(err => {
      //     this.loading = false;
      //   });
    },
    // 关闭修改密码模态框
    closePasswordDialog() {
      this.$refs.newPasswordForm.clearValidate();
      this.passwordDialog = false;
      this.newPasswordData = {
        oldPassword: "",
        newPassword: "",
        sedcondPassword: ""
      };
    },
    // 修改密码
    // async updatePassword() {
    //   await this.$refs.newPasswordForm.validate();
    //   this.loading = true;
    //   api
    //     .editAccountPassword(this.newPasswordData)
    //     .then(res => {
    //       if (res.code === 200) {
    //         this.$message.success("修改成功");
    //         this.closePasswordDialog();
    //       } else {
    //         this.$message.warning(res.msg);
    //       }
    //       this.loading = false;
    //     })
    //     .catch(err => {
    //       this.loading = false;
    //     });
    // },
    // 获取当前企业信息
    getCompanyInfo() {
      api.getUserCompanyInfo().then(res => {
        if (res.code === 200) {
          const { data } = res;
          this.updateCompanyInfo = {
            orgScale: data.orgScale,
            linkMan: data.linkMan,
            linkPhone: data.linkPhone,
            orgName: data.orgName,
            orgRealName: data.orgRealName,
            expireTime: data.expireTime,
            parentOrgName: data.parentOrgName,
            parentLinkMan: data.parentLinkMan,
            parentLinkPhone: data.parentLinkPhone
          };
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 打开企业信息模态框
    openCompanyDialog() {
      if (this.realNameVerify == 1) {
        // if (this.userOrgType.orgType == 5) {
        this.auTonYmBtn = "查看实名信息";
        // } else {
        //   this.auTonYmBtn = "重新实名";
        // }
      } else {
        this.auTonYmBtn = "开始实名";
      }
      this.getCompanyInfo();
      this.companyInfoDialog = true;
    },
    // 修改企业信息
    async updateCompanyInfos() {
      await this.$refs.companyInfoForm.validate();
      this.loading = true;
      api
        .editCompanyInfo(this.updateCompanyInfo)
        .then(res => {
          if (res.code === 200) {
            this.$message.success(res.msg);
            this.companyInfoDialog = false;
          } else {
            this.$message.warning(res.msg);
          }
          this.loading = false;
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 关闭企业信息模态框
    closeCompanyInfos() {
      this.$refs.companyInfoForm.clearValidate();
      this.companyInfoDialog = false;
      this.updateCompanyInfo = {
        linkMan: "",
        linkPhone: "",
        orgScale: 0,
        orgName: ""
      };
    },
    // 获取所有字典
    findDictAllList() {
      this.$api.findDictAllList().then(res => {
        console.log("字典", res);
        if (res.code === 200) {
          this.$store.commit("modificationDictionary", res.data);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    searchMenuDataAuthorize() {
      this.$api.searchMenuDataAuthorize().then(res => {
        console.log("字典", res);
        if (res.code === 200) {
          this.$store.commit("setMenuData", res.data);
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    getLoginList(type) {
      if (type == 1) {
        this.searchMenuDataAuthorize();
      }
      this.$api.findUserByTelephone({ sourceType: 1 }).then(res => {
        if (res.code === 200) {
          if (res.data.length > 0) {
            this.userList = res.data;
            if (type == 2) {
              this.nowSelCon = this.userList.filter(item => item.userId == this.user.pkId)[0];
              this.centerDialogVisible = true;
            }
          } else {
            this.$message.warning("登陆已过期");
            this.$router.replace("/login");
          }
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    openCenterDialog() {
      this.getLoginList(2);
      this.tabPosition = this.user.pkId;
      // this.centerDialogVisible = true;
    },
    multipleAccountSelection() {
      if (this.tabPosition === this.user.pkId) {
        return (this.centerDialogVisible = false);
      }
      if (this.btnDisable) {
        return;
      }
      const data = {
        forceType: 1,
        phoneNumber: this.user.telephone,
        pkId: this.tabPosition,
        sourceType: 1
      };
      this.loadings = true;
      this.btnDisable = true;
      this.$api
        .switchLogin(data)
        .then(res => {
          this.loadings = false;
          if (res.code === 200) {
            sessionStorage.setItem("token", res.data.access_token);
            sessionStorage.removeItem("router");
            sessionStorage.removeItem("saveProId");
            this.$store.commit("setTagsList", [{ path: "/home/home", title: "首页", name: "home" }]);
            this.loadings = false;
            this.$nextTick(() => {
              this.$router.replace("/empty");
            });
            // if (location.hash !== "#/home/home") {
            //   this.$router.replace("/");
            // }
            // this.centerDialogVisible = false;
            // this.getRouter();
            // setTimeout(() => {
            //   this.$router.go(0);
            // }, 500);
            // if (location.hash === "#/home/home") {
            // } else {
            //   setTimeout(()=>{
            //     this.$router.go(0);
            //   },200)
            // }
          } else {
            this.$message.warning(res.msg);
            this.btnDisable = false;
          }
        })
        .catch(err => {
          this.$message.error(res.msg);
          this.btnDisable = false;
          this.loading2 = false;
          this.btnDisable = false;
        });
    },
    userLogin() {
      this.$api
        .userLogin(this.ruleForm)
        .then(res => {
          if (res.code == 200) {
            // 登录成功存token
            if (this.checked) {
              localStorage.setItem("token", res.data.access_token);
            } else {
              sessionStorage.setItem("token", res.data.access_token);
            }
            this.loadings = false;
            this.$router.replace("/home/home");

            this.$message({
              message: "恭喜你,登录成功",
              type: "success"
            });
            // this.centerDialogVisible = false;
          } else if (res.code == 207517) {
            this.loadings = false;
            this.$alert(res.msg, "提示", {
              confirmButtonText: "确定",
              callback: action => {
                if (action == "confirm") {
                  this.ruleForm.forceType = 1;
                  this.submitForm(formName);
                }
              }
            });
          } else {
            this.loadings = false;
            // this.getImgecode();
            this.loading = !this.loading;
            this.$message({ message: res.msg, type: "error" });
            //  错误三次就手机
            if (res.data == 4) {
              this.typeNumber = 1;
              this.ruleForm.code = "";
            }
          }
        })
        .catch(err => {
          this.loading = !this.loading;
        });
    }
    // getRouter() {
    //   this.$api.getRoute().then(res => {
    //     console.log("路由信息", res);
    //     store.commit("initRoutes", res.data);
    //   });
    // }
  },
  computed: {
    user() {
      return this.$store.state.user.pkId ? this.$store.state.user : JSON.parse(sessionStorage.getItem("user") || "{}");
    },
    realNameVerify() {
      return this.$store.state.realNameVerify;
    },
    showUserList() {
      return this.userList.filter(item => item.userId != this.nowSelCon.userId);
    },
    headImg() {
      return this.user.isDefaultPortraitUrl == 1 ? this.user.portraitUrl : this.user.defaultPortraitUrl;
    }
  }
};
</script>

<style lang="scss" scoped>
.el-header {
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #546481;
  padding: 0;
  border-bottom: 1px solid #e5e5e5;

  .logo-title {
    padding-left: 53px;
    display: flex;
    align-items: center;

    img {
      width: 40px;
      height: 40px;
    }

    h3 {
      margin-left: 16px;
      font-size: 22px;
      color: rgba(7, 7, 7, 1);
    }
  }

  .user-name {
    display: flex;
    padding-right: 24px;
    align-items: center;

    .user-img {
      width: 20px;
      height: 20px;
      margin-left: 15px;
    }

    .user {
      margin-left: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      position: relative;
      font-size: 14px;
      margin-right: 26px;

      // 头像
      .head-img {
        width: 40px;
        height: 40px;
        margin-left: 16px;
        border-radius: 50%;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
        }
      }

      .user-set {
        position: absolute;
        border-radius: 8px;
        top: 40px;
        width: 130px;
        height: 140px;
        display: none;
        padding: 8px 0;
        // background-color: #546481;
        // background-color: #ffff;
        // box-shadow: 0px 0px 2px 2px;
        z-index: 11;
        border-radius: 4px;
        background: rgba(255, 255, 255, 1);
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);

        li {
          height: 30px;
          width: 100%;
          line-height: 30px;
          list-style: none;
          color: #546481;
          text-align: center;
          &:hover {
            // background: rgb(187, 213, 241);
            background: rgba(240, 247, 255, 1);
          }
        }
      }

      &:hover .user-set {
        display: block;
      }
    }
  }
}

.user-xian {
  width: 122px;
  height: 1px;
  opacity: 1;
  transform: rotate(180deg);
  background: linear-gradient(270deg, rgba(221, 221, 221, 0) 0%, rgba(221, 221, 221, 1) 100%);
  // border: solid 1px #000;
  position: absolute;
  top: 34px;
  // right:30px;
  left: -4px;
  z-index: 99;
}
.user-size {
  font-size: 14px;
  font-weight: 500;
  line-height: 19.21px;
  color: rgba(51, 51, 51, 1);
  text-align: right;
}

.log-out {
  cursor: pointer;
  display: flex;
  align-items: center;

  .icontuichudenglu {
    color: #b6b6b6;
    font-size: 22px;
  }

  span {
    margin-left: 2px;
  }
}

.el-input,
.el-select,
.el-textarea {
  width: 80%;
}

/deep/ .el-textarea__inner {
  //el_input中的隐藏属性
  resize: none; //主要是这个样式
}

.sendCode {
  width: 45%;
}

.codep {
  text-align: center;

  .spacing {
    width: 150px;
    margin-bottom: 20px;
  }
}

.no-autofill-pwd {
  /deep/ .el-input__inner {
    -webkit-text-security: disc !important;
  }
}

.qr-title {
  text-align: center;

  .close-qrcode {
    position: absolute;
    right: 10px;
    top: 10px;
  }

  .hint-tit {
    padding-top: 20px;
  }

  /deep/ .el-dialog__header {
    background-color: #cfd7da;
    text-align: left;
  }

  #qrCodes {
    display: flex;
    justify-content: center;
    padding: 20px 0;
    position: relative;
    height: 300px;

    .codeTime {
      width: 260px;
      height: 260px;
      line-height: 260px;
      font-size: 30px;
      font-weight: 600;
      position: absolute;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      text-align: center;

      i {
        cursor: pointer;
      }
    }
  }

  .el-dialog__body {
    position: relative;

    p {
      color: #3aa1ff;
    }
  }
}

// .multi-account {
//   background: #fff;

//   .center {
//     margin-top: 25px;
//     text-align: center;
//   }

//   /deep/ .el-dialog {
//     background: #f2f2f2;
//   }

//   /deep/ .el-dialog__title {
//     font-size: 20px;
//     font-weight: 800;
//     color: #3b7ce6;
//   }

//   .radio-button {
//     display: block;

//     /deep/ .el-radio-button__inner {
//       width: 100%;
//     }
//   }
// }
.multi-account {
  // background-image: url(../../assets/maskLayer.png);
  background-image: url(../../../../assets/maskLayer.png);

  /deep/ .el-dialog__footer {
    border: none;
  }

  .multi-account-title {
    font-size: 24px;
    // color: #52acff;
    padding-top: 62px;
    padding-bottom: 35px;
    padding-left: 30px;
    font-weight: 700;
  }
  .mt-20 {
    margin-top: 20px;
  }
  .multi-account-title2 {
    padding-left: 30px;
    font-size: 20px;
    font-weight: 700;
    color: rgba(32, 52, 87, 1);
  }
  .center {
    // margin-top: 25px;
    text-align: center;
  }

  /deep/ .el-dialog__header {
    padding: 0;
  }

  /deep/ .el-dialog {
    background: #fff;
    border-radius: 10px;
  }

  /deep/ .el-dialog__title {
    font-size: 24px;
    // font-weight: 800;
    color: #3b7ce6;
  }

  .radio-button {
    display: block;

    /deep/ .el-radio-button__inner {
      width: 100%;
    }
  }

  .centerDialog {
    max-height: 478px;
    overflow: auto;

    .item-box {
      display: flex;
      align-items: center;
      width: 540px;
      height: 90px;
      background-color: #e4edf3;
      margin: 0 auto;
      border-radius: 8px;
      margin-bottom: 20px;
      color: #333333;
      box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);

      .head-portrait {
        width: 60px;
        height: 60px;
        // line-height: 60px;
        // margin-top: 16px;
      }

      .filleted-corner {
        background: #fff;
        border-radius: 50%;
      }

      .item-box-title {
        text-align: left;
        font-size: 16px;
        line-height: 18px;
        margin-top: 13px;
        width: 420px;
        overflow: hidden; //溢出内容隐藏
        text-overflow: ellipsis; //文本溢出部分用省略号表示
        display: -webkit-box; //特别显示模式
        -webkit-line-clamp: 2; //行数
        line-clamp: 2;
        -webkit-box-orient: vertical; //盒子中内容竖直排列
      }

      .mange-user {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 50px;
        height: 16px;
        margin-left: 6px;
        background: linear-gradient(90deg, rgba(204, 204, 204, 1) 0%, rgba(204, 204, 204, 0) 100%);
        color: rgba(32, 52, 87, 0.4);
        font-size: 12px;

        .mange-user-img {
          position: absolute;
          left: 6px;
          top: 3px;

          .user-img-ico {
            width: 18px;
            height: 18px;
            line-height: 17px;
            color: #1890ff;
            background: #fff;

            /deep/ .el-icon-user-solid {
              font-size: 12px;
            }
          }
        }

        .mange-user-text {
          position: absolute;
          left: 29px;
          top: 4px;
        }
      }
    }

    .item-box-forbidden {
      background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(170, 170, 170, 0.1) 100%) !important;
    }

    .pitch-on {
      background: repeating-linear-gradient(to bottom, #7cd1f8, #21b2f2);
      color: #fff;

      .mange-user {
        background-color: #fff;
        color: #1890ff;

        .mange-user-img {
          .user-img-ico {
            color: #fff;
            background: #1890ff;
          }
        }
      }
    }
    .bg1 {
      background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 159, 63, 0.1) 100%);
    }
    .bg2 {
      background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(212, 48, 48, 0.1) 100%);
    }
    .bg3 {
      background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(42, 130, 228, 0.1) 100%);
    }
    .bg4 {
      background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(18, 224, 101, 0.1) 100%);
    }
    .bg5 {
      background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(66, 18, 224, 0.1) 100%);
    }
  }

  .btn-width {
    width: 157px;
  }

  .mr-20 {
    margin-right: 20px;
  }

  .footerBrn {
    padding: 12px 64px;
    border-radius: 2px;
    color: #fff;
    cursor: pointer;
  }

  .okBtn {
    background: linear-gradient(180deg, rgba(124, 209, 248, 1) 0%, rgba(7, 169, 240, 1) 100%);
  }

  .cancelBtn {
    background: linear-gradient(180deg, rgba(214, 214, 214, 1) 0%, rgba(171, 171, 171, 1) 100%);
  }
}

.violet {
  font-size: 14px;
  color: rgb(90, 11, 163);
}

.codeOk {
  position: absolute;
  top: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #fff;
  z-index: 1;

  .iconColor {
    color: #6bc839;
    font-size: 40px;
  }

  .mb-20 {
    margin-bottom: 20px;
  }

  .mb-60 {
    margin-bottom: 60px;
  }
}

.flex {
  display: flex;
  justify-content: center;
  align-items: center;
}

.bar {
  height: 74px !important;
}

.box-administration {
  white-space: nowrap;
  text-shadow: 1px 1px 5px rgba(250, 205, 145, 0.647058823529412);
  -webkit-text-shadow: 1px 1px 5px rgba(250, 205, 145, 0.647058823529412);
  -moz-text-shadow: 1px 1px 5px rgba(250, 205, 145, 0.647058823529412);
  text-transform: none;
  font-family: "Arial Normal", "Arial", sans-serif;
  font-weight: 400;
  font-size: 28px !important;
}

.h-680 {
  height: 680px;
}

.showLoading {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  z-index: 9999;
}
.orgNameInput {
  display: flex;
  align-items: center;
  width: 80%;
  .inputs {
    width: calc(100% - 80px);
  }
  .el-input {
    width: 100%;
  }
  .orgTypes {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 160px;
    height: 28px;
    margin-top: -2px;
    color: #000;
    background-color: #81d3f8;
  }
}
.changePhoneDia {
  .el-input {
    width: 100%;
  }
  .errMsg {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
  }
  .accList {
    overflow: auto;
    padding: 0 10px;
    background: #f2f2f2;
    height: 200px;
    .el-checkbox {
      display: block;
    }
  }
  .codeShow-box {
    background: #f2f2f2;
    height: 280px;
    text-align: center;
    // padding-top: 10px;

    .qrCodes {
      width: 210px;
      margin: 0 auto;
      padding: 6px;
      background: #fff;
    }

    .codeShow-btn {
      padding-top: 80px;

      .el-icon-refresh-right {
        color: #000;
        font-size: 50px;
        font-weight: 500;
      }

      .el-icon-check {
        font-size: 40px;
        font-weight: 400;
      }
    }

    .text {
      line-height: 28px;
    }
  }
}
.orgTyepName {
  display: flex;
  align-items: center;
  height: 90px;
  margin-left: 10px;
  writing-mode: horizontal-tb;
  color: blue;
}
.shabi {
  position: absolute;
  right: 20px;
  bottom: 20px;
  color: rgba(204, 204, 204, 1);
  font-size: 14px;
}
.df {
  display: flex;
  align-items: center;
  margin-top: 6px;
  .loginName {
    display: flex;
    justify-content: start;
    max-width: 400px;
    text-align: left;
    color: rgba(32, 52, 87, 0.6);
  }
}
.orgInfo {
  position: relative;
  width: 406px;
  height: 145px;
  margin-left: 50px;
  padding-top: 20px;
  border: 1px dashed #000;
  .orgInfo-title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: -16px;
    font-size: 20px;
    font-weight: 700;
    background-color: #fff;
  }
}
.userInfoDialog {
  display: flex;
  margin: 40px 0;
  .userInfoDialog-avg {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 420px;
    .big-avg {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      overflow: hidden;
      img {
        width: 200px;
        height: 200px;
      }
    }
    .sel-avg {
      display: flex;
      justify-content: space-evenly;
      width: 200px;
      margin-top: 40px;
      .sel-avg-item {
        .imgs {
          width: 60px;
          height: 60px;
          margin-bottom: 12px;
          border-radius: 50%;
          overflow: hidden;
        }
        .uploads {
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 24px;
          background-color: #eeeeee;
          cursor: pointer;
        }
        img {
          width: 60px;
          height: 60px;
        }
        .upload-again {
          cursor: pointer;
          color: #2a82e4;
        }
      }
      .sel {
        position: relative;
        &::after {
          content: "";
          position: absolute;
          top: -5px;
          left: -5px;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: 2px solid #2a82e4;
          z-index: 1;
        }
      }
    }
  }
  .userInfoDialog-info {
    width: calc(100% - 420px);
    .el-input {
      width: 300px;
    }
  }
}
.footer-right {
  /deep/ .el-dialog__footer {
    text-align: right;
  }
  .dialog-footer {
    text-align: right;
    /deep/ .el-button--primary {
      width: 200px;
    }
  }
}
</style>
