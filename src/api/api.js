import { httpDelete, httpGet, httpPost, httpPut } from "./http";
const api = {
  // 登录
  imgCode: (params = {}) =>
    httpGet({
      url: "/code",
      params
    }), // 图形验证码
  mobileMsg: (data = {}) =>
    httpPost({
      url: "/auth/send/verification/code",
      data
    }), // 获取手机短信
  userLogin: (data = {}) =>
    httpPost({
      url: "/auth/sysLogin",
      data
    }), // 登录
  getRoute: (data = {}) =>
    httpGet({
      url: "/operation/sysMenu/getRouters",
      data
    }), // 路由
  getUserInfoByName: (params = {}) =>
    httpGet({
      url: "/operation/login/findUserByLoginName",
      params
    }), // 根据名字获取当前用户信息
  logout: (params = {}) =>
    httpDelete({
      url: "/auth/sysLogout",
      params
    }), // 退出登陆
  delFiles: (params = {}) =>
    httpDelete({
      url: "/eng/file/deleteBatch/picture",
      params
    }), // 批量删除文件
  // 系统管理==============================================
  // 系统角色
  getSystemRolePageList: (params = {}) =>
    httpGet({
      url: "/operation/org/role/searchPage",
      params
    }), // 角色分页列表
  addSystemRole: (data = {}) =>
    httpPost({
      url: "/operation/org/role",
      data
    }), // 新增系统角色
  editSystemRole: (data = {}) =>
    httpPut({
      url: "/operation/org/role",
      data
    }), // 编辑系统角色
  delSystemRoleById: (params = {}) =>
    httpDelete({
      url: "/operation/org/role",
      params
    }), // 根据ID删除角色信息
  getDefaultSystemRolePageList: (params = {}) =>
    httpGet({
      url: "/operation/org/role/searchDefaultPage",
      params
    }), // 默认角色分页列表
  getPutDownSystemRoleList: (params = {}) =>
    httpGet({
      url: "/operation/org/role/searchForALlRoleList",
      params
    }), // 系统角色下拉列表
  getSystemRoleInfoById: (params = {}) =>
    httpGet({
      url: "/operation/org/role/searchForRole",
      params
    }), // 根据角色主键id查询角色信息

  getAllMenuPermissionList: (params = {}) =>
    httpGet({
      url: "/operation/sysMenu/searchForAllMenuPermissionList",
      params
    }), // 获取所有的菜单资源权限列表
  getMenuPermissionByRoleType: (params = {}) =>
    httpGet({
      url: "/operation/sysMenu/searchForRoleMenuPermissionList",
      params
    }), // 根据企业角色类型获取菜单权限列表

  // 收费模式
  addChargingMode: (data = {}) =>
    httpPost({
      url: "/operation/sysChargingMode",
      data
    }), // 新增收费模式
  editChargingMode: (data = {}) =>
    httpPut({
      url: "/operation/sysChargingMode",
      data
    }), // 编辑收费模式
  getChargingModePageList: (params = {}) =>
    httpGet({
      url: "/operation/sysChargingMode/searchPage",
      params
    }), // 收费模式分页列表
  getChargingModeById: (params = {}) =>
    httpGet({
      url: "/operation/sysChargingMode",
      params
    }), // 根据收费模式主键id查询信息
  delChargingModeById: (params = {}) =>
    httpDelete({
      url: "/operation/sysChargingMode",
      params
    }), // 根据收费模式主键id删除收费信息

  // 商务用户
  addOrg: (data = {}) =>
    httpPost({
      url: "/operation/sysOrg",
      data
    }), // 新增组织
  getInfoByOrgId: (params = {}) =>
    httpGet({
      url: "/operation/sysOrg",
      params
    }), // 根据组织主键id查询信息
  editUseTypeById: (params = {}) =>
    httpPut({
      url: "/operation/sysOrg/modifyStatus",
      params
    }), // 根据组织主键id修改使用状态
  orgApplyRenewal: (data = {}) =>
    httpPost({
      url: "/operation/sysOrg/renewal",
      data
    }), // 组织申请续期
  renewalAudit: (data = {}) =>
    httpPut({
      url: "/operation/sysOrg/renewal/auth",
      data
    }), // 续期审核
  getOrgPageList: (params = {}) =>
    httpGet({
      url: "/operation/sysOrg/searchPage",
      params
    }), // 组织分页列表
  certificationAuth: (params = {}) =>
    httpPut({
      url: "/operation/sysOrg/auth",
      params
    }), // 认证审核
  searchLinkPage: (params = {}) =>
    httpGet({
      url: "/operation/sysOrg/searchLinkPage",
      params
    }), // 认证审核
  // 组织管理
  getConstructionUnitList: (params = {}) => httpGet({ url: "/operation/sysOrg/constructionUnitList", params }), // 获取施工单位列表
  getUserCompanyInfo: (params = {}) =>
    httpGet(
      {
        url: "/operation/sysOrg/info"
      },
      params
    ), // 获取当前登陆者企业信息
  editCompanyInfo: (data = {}) =>
    httpPut({
      url: "/operation/sysOrg/info",
      data
    }), // 修改企业信息

  getorgInfoByIds: (params = {}) =>
    httpGet({
      url: "/operation/sysOrg/orgInfoByIds",
      params
    }), // 根据组织主键id获取组织名称以及上级组织名称
  getDepartmentByUnitId: (params = {}) =>
    httpGet({
      url: "/operation/sysOrg/projectList",
      params
    }), // 根据施工单位主键id获取项目部列表
  AccountRegistration: (data = {}) =>
    httpPost({
      url: "/auth/pc/register",
      data
    }), // 账号注册

  // 系统分项表
  addSystemEPC: (data = {}) =>
    httpPost({
      url: "/operation/itemList/add",
      data
    }), // 新增系统分项工程
  detailDategory: (data = {}) =>
    httpPost({
      url: "/operation/itemList/configDetailClass",
      data
    }), // 配置细目类别数据
  itemClass: (data = {}) =>
    httpPost({
      url: "/operation/itemList/configMaterialType",
      data
    }), // 配置物料分类数据
  deleteEPC: (params = {}) =>
    httpDelete({
      url: "/operation/itemList/delete",
      params
    }), // 根据ID删除系统分项工程
  queryEPC: (params = {}) =>
    httpGet({
      url: "/operation/itemList/findItemListById",
      params
    }), // 根据ID查询系统分项工程
  processFlow: (params = {}) =>
    httpGet({
      url: "/operation/itemList/searchByItemIds",
      params
    }), // 根据分项工程ID集判断是否都在同一个工序流程里 是，则返回流程名称 否则返回null
  termQueryEPC: (params = {}) =>
    httpGet({
      url: "/operation/itemList/searchPage",
      params
    }), // 根据条件查询系统分项工程，分页展示
  quickPass: (params = {}) =>
    httpGet({
      url: "/operation/itemList/searchProcessByItemId",
      params
    }), // 根据分项工程ID获取对应流程以及付带的所有数据集（流程节点、表格和资料）
  modifyEPC: (data = {}) =>
    httpPut({
      url: "/operation/itemList/update",
      data
    }), // 根据ID修改系统分项工程
  baseItemListFirstAll: (params = {}) =>
    httpGet({
      url: "/operation/itemList/baseItemListFirstAll",
      params
    }), // 根据专业类别查询所有工程分类
  baseItemListAmount: (params = {}) =>
    httpGet({
      url: "/operation/itemList/baseItemListAmount",
      params
    }), // 查询同等级下的项目工程条数
  // 流程设置
  addFlow: (data = {}) =>
    httpPost({
      url: "/operation/workflow/add",
      data
    }), // 新增系统流程模板
  deleteFlow: (params = {}) =>
    httpDelete({
      url: "/operation/workflow/delete",
      params
    }), // 根据ID删除系统流程模板
  queryFlow: (params = {}) =>
    httpGet({
      url: "/base/baseWorkflowTemplate/findWorkflowTemplateById",
      params
    }), // 根据ID查询系统流程模板
  termQueryFlow: (params = {}) =>
    httpGet({
      url: "/base/baseWorkflowTemplate/search",
      params
    }), // 根据条件查询系统流程模板
  pagingDisplay: (params = {}) =>
    httpGet({
      url: "/operation/workflow/searchPage",
      params
    }), // 根据条件查询系统流程模板，分页展示
  searchPageByOrgId: (params = {}) =>
    httpGet({
      url: "/operation/workflow/searchPageByOrgId",
      params
    }), // 根据条件查询系统流程模板，分页展示
  modifyFlow: (data = {}) =>
    httpPut({
      url: "/base/baseWorkflowTemplate/update",
      data
    }), // 根据ID修改系统流程模板
  configurationItem: (params = {}) =>
    httpPut({
      url: "/operation/workflow/updateItemsById",
      params
    }), // 根据ID修改系统流程模板流程的配置分项工程
  productionasr: (params = {}) =>
    httpPut({
      url: "/eng/prodItemList/updateItemsById",
      params
    }), // 根据ID修改系统流程模板流程的配置分项工程
  publishStatus: (params = {}) =>
    httpPut({
      url: "/operation/workflow/updateStatusById",
      params
    }), // 根据ID修改系统流程模板流程的发布状态
  findWorkflowTemplateById: (params = {}) =>
    httpGet({
      url: "/operation/workflow/findWorkflowTemplateById",
      params
    }), // 根据ID查询系统流程模板
  baseWorkflowUpdate: (data = {}) =>
    httpPut({
      url: "/operation/workflow/update",
      data
    }), // 编辑流程
  searchWorkflowTemplateList: (params = {}) =>
    httpGet({
      url: "/operation/workflow/searchWorkflowTemplateList",
      params
    }), // 获取子程序列表
  configurationITtem: (params = {}) =>
    httpGet({
      url: "/operation/itemList/baseItemListsAll",
      params
    }), // 配置分项列表
  searchWorkflowTemplateById: (params = {}) =>
    httpGet({
      url: "/operation/workflow/searchWorkflowTemplateById",
      params
    }), // 根据模板主键id查询模板节点相关信息
  searchOrgProcessByItemId: (params = {}) =>
    httpGet({
      url: "/eng/prodItemList/searchOrgProcessByItemId",
      params
    }),
  searchListByOrgId: (params = {}) =>
    httpGet({
      url: "/operation/workflow/searchListByOrgId",
      params
    }),

  // 技术规范、安全规范、验收标准
  addPdf: (data = {}) =>
    httpPost({
      url: "/operation/bookPdf/add",
      data
    }), // 新增PDF资料数据
  deletePdf: (params = {}) =>
    httpDelete({
      url: "/operation/bookPdf/delete",
      params
    }), // 根据ID删除PDF资料
  queryPdf: (params = {}) =>
    httpGet({
      url: "/operation/bookPdf/findBookPdfById",
      params
    }), // 根据ID查询PDF资料
  conditionPdf: (params = {}) =>
    httpGet({
      url: "/operation/bookPdf/searchPage",
      params
    }), // 根据条件查询PDF资料，分页展示
  modifyPdf: (data = {}) =>
    httpPut({
      url: "/operation/bookPdf/update",
      data
    }), // 根据ID修改PDF资料
  searchPdfListByType: (params = {}) =>
    httpGet({
      url: "/operation/bookPdf/searchPdfListByType",
      params
    }), // 获取pdf下拉列表

  // 表格管理
  addForm: (data = {}) =>
    httpPost({
      url: "/operation/table/add",
      data
    }), // 新增表格数据
  deleteForm: (params = {}) =>
    httpDelete({
      url: "/operation/table/delete",
      params
    }), // 根据ID删除表格
  queryForm: (params = {}) =>
    httpGet({
      url: "/operation/table/findBaseTableById",
      params
    }), // 根据ID查询表格数据
  allForm: (params = {}) =>
    httpGet({
      url: "/base/baseTable/search",
      params
    }), // 根据条件查询表格
  pageForm: (params = {}) =>
    httpGet({
      url: "/operation/table/searchPage",
      params
    }), // 根据条件查询表格，分页展示
  modifyForm: (data = {}) =>
    httpPut({
      url: "/operation/table/update",
      data
    }), // 根据ID修改表格数据
  baseTableSearch: (params = {}) =>
    httpGet({
      url: "/operation/table/search",
      params
    }), // 根据条件查询表格列表
  // 物料信息

  addMaterial: (data = {}) =>
    httpPost({
      url: "/operation/material/add",
      data
    }), // 新增物料
  deleteMaterial: (params = {}) =>
    httpDelete({
      url: "/operation/material/delete",
      params
    }), // 根据ID删除物料
  queryMaterial: (params = {}) =>
    httpGet({
      url: "/operation/material/findMaterialById",
      params
    }), // 根据ID查询物料数据
  conditionMaterial: (params = {}) =>
    httpGet({
      url: "/base/baseMaterial/search",
      params
    }), // 根据条件查询物料
  Material: (params = {}) =>
    httpGet({
      url: "/operation/material/searchPage",
      params
    }), // 根据条件查询BaseMaterial，分页展示
  modifyMaterial: (data = {}) =>
    httpPut({
      url: "/operation/material/update",
      data
    }), // 根据ID修改物料
  // 物料分类管理
  addMaterialclassify: (data = {}) =>
    httpPost({
      url: "/operation/materialType/add",
      data
    }), // 新增物料分类数据
  deleteMaterialclassify: (params = {}) =>
    httpDelete({
      url: "/operation/materialType/delete",
      params
    }), // 根据ID删除物料分类
  queryMaterialclassify: (params = {}) =>
    httpGet({
      url: "/operation/materialType/findMaterialTypeById",
      params
    }), // 根据ID查询物料分类数据
  querylistAllByEngTypeId: (params = {}) =>
    httpGet({
      url: "/base/baseMaterialType/listAllByEngTypeId",
      params
    }), // 根据工程类型ID查询所有物料分类
  searchMaterialTypeByEngTypeId: (params = {}) =>
    httpGet({
      url: "/base/baseMaterialType/searchMaterialTypeByEngTypeId",
      params
    }), // 根据工程类型ID查询物料分类全部数据
  conditionMaterialclassify: (params = {}) =>
    httpGet({
      url: "/operation/materialType/listAll",
      params
    }), // 查询物料分类全部数据
  modifyMaterialclassify: (data = {}) =>
    httpPut({
      url: "/operation/materialType/update",
      data
    }), // 根据ID修改物料分类数据
  // 工程细目
  addInventory: (data = {}) =>
    httpPost({
      url: "/operation/detailTable/add",
      data
    }), // 新增系统细目
  deleteInventory: (params = {}) =>
    httpDelete({
      url: "/operation/detailTable/delete",
      params
    }), // 根据ID删除系统细目
  queryInventory: (params = {}) =>
    httpGet({
      url: "/operation/detailTable/findDetailTableById",
      params
    }), // 根据ID查询系统细目
  allInventory: (params = {}) =>
    httpGet({
      url: "/operation/detailTable/listAll",
      params
    }), // 查询系统细目全部数据
  queryAllInventory: (params = {}) =>
    httpGet({
      url: "/operation/detailTable/listPage",
      params
    }), // 查询系统细目全部数据，分页展示
  queryTable: (data = {}) =>
    httpPut({
      url: "/base/baseDetailTable/search",
      data
    }), // 根据条件查询BaseDetailTable
  tablePage: (params = {}) =>
    httpGet({
      url: "/operation/detailTable/searchPage",
      params
    }), // 根据条件查询BaseDetailTable，分页展示
  modifyInventory: (data = {}) =>
    httpPut({
      url: "/operation/detailTable/update",
      data
    }), // 根据ID修改系统细目
  // 系统细目类别管理
  addCategory: (data = {}) =>
    httpPost({
      url: "/operation/detailClass/add",
      data
    }), // 新增系统细目类别
  deleteCategory: (params = {}) =>
    httpDelete({
      url: "/operation/detailClass/delete",
      params
    }), // 根据ID删除系统细目类别
  queryCategory: (params = {}) =>
    httpGet({
      url: "/operation/detailClass/findDetailClassById",
      params
    }), // 根据ID查询系统细目类别
  listAllByEngTypeId: (params = {}) =>
    httpGet({
      url: "/base/baseDetailClass/listAllByEngTypeId",
      params
    }), // 根据工程类型ID查询所有系统细目类别
  listAllEngType: (params = {}) =>
    httpGet({
      url: "/base/baseDetailClass/listAllEngType",
      params
    }), // 根据工程类型ID查询所有专业类别
  listAllByProfessionalTypeId: (params = {}) =>
    httpGet({
      url: "/operation/detailClass/listAllByProfessionalTypeId",
      params
    }), // 根据专业类别ID查询所有系统细目类别
  listAllByProfessionalTypeId2: (params = {}) =>
    httpGet({
      url: "/operation/detailClass/searchByProfessionalTypeId",
      params
    }), // 根据专业类别ID查询所有系统细目类别
  listAllByProfessionalTypeId3: (params = {}) =>
    httpGet({
      url: "/operation/detailClass/customizedSearchByProfessionalTypeId",
      params
    }), // 根据专业类别ID查询所有系统细目类别
  searchDetailClassByEngTypeId: (params = {}) =>
    httpGet({
      url: "/operation/detailClass/searchDetailClassByEngTypeId",
      params
    }), // 根据工程类型ID查询所有系统细目类别
  detailClassById: (params = {}) =>
    httpGet({
      url: "/operation/detailClass/detailClassById",
      params
    }), // 根据专业类别ID或清单类别ID查询系统细目类别
  allCategory: (params = {}) =>
    httpGet({
      url: "/base/baseDetailClass/listAll",
      params
    }), // 查询系统细目类别全部数据
  modifyCategory: (data = {}) =>
    httpPut({
      url: "/operation/detailClass/update",
      data
    }), // 根据ID修改系统细目类别
  // 单位管理
  addUnits: (data = {}) =>
    httpPost({
      url: "/operation/unit/add",
      data
    }), // 新增单位
  deleteUnits: (params = {}) =>
    httpDelete({
      url: "/operation/unit/delete",
      params
    }), // 根据ID删除单位
  queryUnits: (params = {}) =>
    httpGet({
      url: "/operation/unit/findUnitById",
      params
    }), // 根据ID查询单位
  conditionUnits: (params = {}) =>
    httpGet({
      url: "/operation/unit/search",
      params
    }), // 根据条件查询单位
  modifyUnits: (data = {}) =>
    httpPut({
      url: "/operation/unit/update",
      data
    }), // 根据ID修改单位

  // 组织结构=================================================================
  // 部门管理
  addDept: (data = {}) =>
    httpPost({
      url: "/operation/sysDept",
      data
    }), // 新增部门
  editDept: (data = {}) =>
    httpPut({
      url: "/operation/sysDept",
      data
    }), // 编辑部门
  getDeptPageList: (params = {}) =>
    httpGet({
      url: "/operation/sysDept/searchPage",
      params
    }), // 部门分页列表
  delDeptById: (params = {}) =>
    httpDelete({
      url: "/operation/sysDept",
      params
    }), // 根据部门主键id删除部门
  // 角色管理
  addRole: (data = {}) =>
    httpPost({
      url: "/operation/sysRole",
      data
    }), // 新增角色
  editRole: (data = {}) =>
    httpPut({
      url: "/operation/sysRole",
      data
    }), // 编辑角色
  getRolePageList: (params = {}) =>
    httpGet({
      url: "/operation/sysRole/searchPage",
      params
    }), // 角色分页列表
  getOrgAllRoleList: (params = {}) =>
    httpGet({
      url: "/operation/sysRole/searchRoleList",
      params
    }), // 查询组织下所有的角色列表
  getOrgAllRoleList2: (params = {}) =>
    httpGet({
      url: "/eng/prodWorkArea/searchRolesByProcess",
      params
    }), // 查询组织下所有的角色列表
  getRoleInfoById: (params = {}) =>
    httpGet({
      url: "/operation/sysRole",
      params
    }), // 根据角色主键id查询角色信息
  delRoleById: (params = {}) =>
    httpDelete({
      url: "/operation/sysRole",
      params
    }), // 根据角色主键id删除角色信息
  getMenuPermissionListByUser: (params = {}) =>
    httpGet(
      {
        url: "/operation/sysMenu/searchForRoleMenuPermissionByOrgType"
      },
      params
    ), // 根据用户获取菜单权限列表
  getAllCanViewMenu: (params = {}) => httpGet({ url: "/operation/sysRole/getAllCanViewMenu", params }), // 查询所有可查看数据菜单
  getOrgDeptAndPeo: (params = {}) => httpGet({ url: "/operation/sysRole/allDept", params }), // 查询该公司下所有的部门以及部门下的员工
  // 员工管理
  getDeptInfoById: (params = {}) =>
    httpGet({
      url: "/operation/sysDept",
      params
    }), // 根据部门主键id查询部门信息
  getOrgAllDeptList: (params = {}) =>
    httpGet({
      url: "/operation/sysDept/searchDeptList",
      params
    }), // 查询该组织下所有部门列表
  getOrgAllDeptList2: (params = {}) =>
    httpGet({
      url: "/eng/prodWorkArea/searchDept",
      params
    }), // 查询该组织下所有部门列表
  addUser: (data = {}) =>
    httpPost({
      url: "/operation/sysUser",
      data
    }), // 新增员工
  editUserInfo: (data = {}) =>
    httpPut({
      url: "/operation/sysUser",
      data
    }), // 编辑员工信息
  resePasswords: (data = {}) =>
    httpPut({
      url: "/auth/pc/reset/password",
      data
    }), // 忘记密码后-重置密码
  initializingPassword: (params = {}) =>
    httpPut({
      url: "/operation/sysUser/initialization",
      params
    }), // 根据员工主键id,初始化密码
  getItemList: (params = {}) =>
    httpGet(
      {
        url: "/operation/sysUser/itemList"
      },
      params
    ), // 获取登陆者所在的组织的所有项目信息
  checkReferenced: (params = {}) =>
    httpGet({
      url: "/operation/login/available",
      params
    }), // 查询账号是否已有人引用
  getPersonInfo: (params = {}) =>
    httpGet({
      url: "/operation/sysUser/personal/info",
      params
    }), // 获取当前登陆者个人信息
  editPersonInfo: (data = {}) =>
    httpPut({
      url: "/operation/sysUser/personal/info",
      data
    }), // 修改个人信息
  editUserAccountType: (params = {}) =>
    httpPut({
      url: "/operation/sysUser/updateStatus",
      params
    }), // 修改员工账号状态
  editAccountPassword: (params = {}) =>
    httpPut({
      url: "/operation/sysUser/update/user/password",
      params
    }), // 修改修改账号密码
  editPhone: (data = {}) =>
    httpPut({
      url: "/operation/sysUser/update/user/phone",
      data
    }), // 修改手机号
  getUserInfoById: (params = {}) =>
    httpGet({
      url: "/operation/sysUser",
      params
    }), // 根据员工主键id查询员工信息
  isCurrentUsersTelephone: (params = {}) =>
    httpGet({
      url: "/auth/isCurrentUsersTelephone",
      params
    }), // 判断是否是当前账号的手机号
  // 所辖项目
  theProject: (params = {}) =>
    httpGet({
      url: "/operation/jurisdictionin/searchPage",
      params
    }), // 管辖项目分页列表
  getAllDeptAndStaff: (params = {}) =>
    httpGet({
      url: "/operation/sysDept/sysOrg/allDept",
      params
    }), // 查询该公司下所有的部门以及部门下的员工
  getUserPageList: (params = {}) =>
    httpGet({
      url: "/operation/sysUser/searchPage",
      params
    }), // 员工分页列表
  findProjectByProOrgId: (params = {}) =>
    httpGet({
      url: "/eng/projProject/findProjectByProOrgId",
      params
    }), // 根据项目部ID查询项目信息
  epcProjectList: (params = {}) =>
    httpGet({
      url: "/eng/projProjectTable/findProjectTableByProOrgId",
      params
    }), // 根据项目部ID查询工程项目数据

  // 项目信息=================================================================
  // 项目概括
  addProject: (data = {}) =>
    httpPost({
      url: "/eng/projProject/add",
      data
    }), // 新增项目
  getProjectInfoById: (params = {}) =>
    httpGet({
      url: "/eng/projProject/findProjectById",
      params
    }), // 根据ID查询项目信息
  getAllProjectInfo: (params = {}) =>
    httpGet({
      url: "/eng/projProject/getItemListNoUserId",
      params
    }), // 获取当前组织的所有项目信息
  getAllProjectInfo2: (params = {}) =>
    httpGet({
      url: "/eng/projProject/projectListNoUserId",
      params
    }), // 获取当前组织的所有标段项目数据集
  getAllProjectList: (params = {}) =>
    httpGet({
      url: "/eng/projProject/allList",
      params
    }), // 获取所有项目信息
  addOrUpdateReUserProject: (data = {}) =>
    httpPut({
      url: "/eng/projProject/saveReUserProject",
      data
    }), // 新增或者编辑用户与项目之间的关系
  getProjectsByIdAndType: (params = {}) =>
    httpGet({
      url: "/eng/projProject/searchByLinkOrgId",
      params
    }), // 根据关联公司ID以及类型查询项目集(内附项目组名称)
  getProjectListByCondition: (params = {}) =>
    httpGet({
      url: "/eng/projProject/searchPage",
      params
    }), // 根据条件查询工程项目，分页展示
  getProjectsInfoByIds: (params = {}) =>
    httpGet({
      url: "/eng/projProject/searchProjectsByIds",
      params
    }), // 根据项目ID集查询项目集
  updateProjectInfoById: (data = {}) =>
    httpPut({
      url: "/eng/projProject/update",
      data
    }), // 根据ID修改项目信息
  delProjectById: (params = {}) =>
    httpDelete({
      url: "/eng/projProject/delete",
      params
    }), // 根据ID删除项目
  allListBidByOrgId: (params = {}) =>
    httpGet({
      url: "/eng/projProject/allListBidByOrgId",
      params
    }), // 根据当前登录组织ID获取所有关联的项目标段
  addProjectBid: (data = {}) =>
    httpPost({
      url: "/eng/projProject/addProjectBid",
      data
    }), // 根据当前登录组织ID新增项目关联项目标段数据
  allListBidByProId: (params = {}) =>
    httpGet({
      url: "/eng/projProject/allListBidByProId",
      params
    }), // 根据项目ID获取所有关联的项目标段集
  getItemListByCustom: (params = {}) =>
    httpGet({
      url: "/eng/projProject/getItemListByCustom",
      params
    }), // 根据客户关系获取当前组织（建设单位、监理公司）的所有项目集信息
  getProItemList: (params = {}) =>
    httpGet({
      url: "/eng/projProject/itemList",
      params
    }), // 获取当前组织的所有项目信息 和员工ID有绑定
  // 项目工程表
  addProjectTable: (data = {}) =>
    httpPost({
      url: "/eng/projProjectTable/addProjectTable",
      data
    }), // 新增工程项目数据
  getProjectTableInfoById: (params = {}) =>
    httpGet({
      url: "/eng/projProjectTable/findProjectTableById",
      params
    }), // 根据ID查询工程项目数据
  getProjectTableListByCondition: (params = {}) =>
    httpGet({
      url: "/eng/projProjectTable/searchPage",
      params
    }), // 根据条件查询工程项目，分页展示
  editProjectTableById: (data = {}) =>
    httpPut({
      url: "/eng/projProjectTable/updateProjectTable",
      data
    }), // 根据ID修改工程项目数据
  delProjectTableById: (params = {}) =>
    httpDelete({
      url: "/eng/projProjectTable/deleteProjectTable",
      params
    }), // 根据ID删除工程项目
  // 客户管理=================================================================
  // 所有角色的客户共用接口
  addCustom: (data = {}) =>
    httpPost({
      url: "/eng/projCustom/add",
      data
    }), // 新增客户数据
  getCustomInfoById: (params = {}) =>
    httpGet({
      url: "/eng/projCustom/findCustomById",
      params
    }), // 根据ID查询客户数据
  getCustomByIdAndType: (params = {}) =>
    httpGet({
      url: "/project/projCustom/searchByLinkOrgId",
      params
    }), // 根据关联公司ID以及类型查询项目ID集
  getCustomByPhone: (params = {}) =>
    httpGet({
      url: "/eng/projCustom/orgLinkPhone",
      params
    }), // 根据联系人手机号查询公司信息
  getCustomPageListByCondition: (params = {}) =>
    httpGet({
      url: "/eng/projCustom/searchPage",
      params
    }), // 根据条件查询合同，分页展示
  getCustomListByType: (params = {}) =>
    httpGet({
      url: "/eng/projContract/search",
      params
    }), // 根据条件查询合同
  editCustomById: (data = {}) =>
    httpPut({
      url: "/eng/projCustom/update",
      data
    }), // 根据ID修改客户数据
  updateCustomRelationById: (params = {}) =>
    httpPut({
      url: "/eng/projCustom/updateRelationById",
      params
    }), // 根据ID修改客户绑定
  delCustomById: (params = {}) =>
    httpDelete({
      url: "/eng/projCustom/delete",
      params
    }), // 根据ID删除客户
  projCustomSearch: (params = {}) =>
    httpGet({
      url: "/eng/projCustom/search",
      params
    }), // 根据条件查询客户
  searchCustomByOrgId: (params = {}) =>
    httpGet({
      url: "/eng/projCustom/searchCustomByOrgId",
      params
    }), // 根据当前登录的施工单位ID获取所属项目部ID所绑定的建设单位集
  searchProOrgByOrgId: (params = {}) =>
    httpGet({
      url: "/eng/projCustom/searchProOrgByOrgId",
      params
    }), // 根据当前登录的施工单位ID获取所属项目部集
  searchBuildByOrgId: (params = {}) =>
    httpGet({
      url: "/eng/projCustom/searchBuildByOrgId",
      params
    }), // 监理公司新增监理合同时查询它的建设单位客户
  searchByCompany: (params = {}) =>
    httpGet({
      url: "/eng/projCustom/searchByCompany",
      params
    }), // 监理公司新增监理合同时查询它的建设单位客户
  customSearchByProOrgId: (params = {}) =>
    httpGet({
      url: "/eng/projCustom/customSearchByProOrgId",
      params
    }), // 根据当前登录关联项目集查询关联的分包单位集
  //
  // 建设单位
  // 简历公司
  // 项目部
  // 供应商
  // 分包单位
  // 生产管理=================================================================
  // 生产设置
  // 分项工程与工区关联数据
  addProjectData: (data = {}) =>
    httpPost({
      url: "/eng/prodReAreaItem/add",
      data
    }), // 新增分项工程与工区关联数据
  getProjectArr: (params = {}) =>
    httpGet({
      url: "/eng/projProject/itemList",
      params
    }), // 获取当前组织的所有项目信息 和员工ID有绑定
  queryProject: (params = {}) =>
    httpGet({
      url: "/eng/prodReAreaItem/findByProjectId",
      params
    }), // 根据项目ID查询分项工程与工区关联数据
  // 基础设置管理
  addSetData: (data = {}) =>
    httpPost({
      url: "/eng/prodBaseSet/addOrUpdate",
      data
    }), // 新增或修改基础设置数据
  queryBasics: (params = {}) =>
    httpGet({
      url: "/eng/prodBaseSet/findByFkProjectId",
      params
    }), // 根据关联项目ID查询基础设置数据
  // 工区管理
  addWorkspace: (data = {}) =>
    httpPost({
      url: "/eng/prodWorkArea/add",
      data
    }), // 新增工区
  updateWorkspace: (data = {}) =>
    httpPut({
      url: "/eng/prodWorkArea/update",
      data
    }), // 根据ID修改工区
  addSubcontractor: (data = {}) =>
    httpPost({
      url: "/eng/prodWorkArea/addAndUpdateCustomAreaItem",
      data
    }), // 新增或修改分包单位与工区关联数据
  addStaffWork: (data = {}) =>
    httpPost({
      url: "/eng/prodWorkArea/addAndUpdateProdReUserAreaItem",
      data
    }), // 新增或修改员工与工区关系数据
  deleteWorkspace: (params = {}) =>
    httpDelete({
      url: "/eng/prodWorkArea/delete",
      params
    }), // 根据ID删除工区
  queryWorkspace: (params = {}) =>
    httpGet({
      url: "/production/prodWorkArea/findById",
      params
    }), // 根据ID查询工区
  querySubcontractor: (params = {}) =>
    httpGet({
      url: "/eng/prodWorkArea/findCustomAreaItem",
      params
    }), // 查询分包单位与工区关联数据
  queryStaff: (params = {}) =>
    httpGet({
      url: "/eng/prodWorkArea/findReUserAreaItemByUserId",
      params
    }), // 根据员工ID查询员工与工区关系数据
  queryCondition: (params = {}) =>
    httpGet({
      url: "/eng/prodWorkArea/search",
      params
    }), // 根据条件查询工区
  workspaceKeyQuery: (params = {}) =>
    httpGet({
      url: "/eng/prodWorkArea/searchForArea",
      params
    }), // 根据工区主键id 查询这个工区的员工Ids
  staffKeyQuery: (params = {}) =>
    httpGet({
      url: "/eng/prodWorkArea/searchWorkArea",
      params
    }), // 根据员工ID查询员工所在的工区
  modifyWorkspace: (params = {}) =>
    httpPut({
      url: "/eng/prodWorkArea/update",
      params
    }), // 根据ID修改工区
  findCustomByUserId: (params = {}) =>
    httpGet({
      url: "/eng/prodWorkArea/findCustomByUserId",
      params
    }), // 根据员工ID查询员工所在的工区集绑定的分包单位集
  findWorkAreasByUserId: (params = {}) =>
    httpGet({
      url: "/eng/prodWorkArea/findWorkAreasByUserId",
      params
    }), // 根据员工ID查询员工所在的工区集
  searchUserPageForOrgId: (params = {}) =>
    httpGet({
      url: "/eng/prodWorkArea/searchUserPageForOrgId",
      params
    }), // 根据当前登录者组织id查询下属所有员工集带工区名称和分页
  findWorkAreaAndItemByOrgId: (params = {}) =>
    httpGet({
      url: "/eng/prodWorkArea/findWorkAreaAndItemByOrgId",
      params
    }), // 根据当前登录项目部ID查询所属工区集，带所属树形分项工程集
  findCustomByOrgId: (params = {}) =>
    httpGet({
      url: "/eng/prodWorkArea/findCustomByOrgId",
      params
    }), // 根据当前登录项目部ID条件查询分包单位集 带工区名称和分页
  findCustomAreaItemView: (params = {}) =>
    httpGet({
      url: "/eng/prodWorkArea/findCustomAreaItemView",
      params
    }), // 查询分包商与工区关联视图数据 树形 带工区名称和分页
  findReUserAreaItemViewByUserId: (params = {}) =>
    httpGet({
      url: "/eng/prodWorkArea/findReUserAreaItemViewByUserId",
      params
    }), // 根据员工ID查询员工与工区关系数据视图 树形
  findAreaItem: (params = {}) =>
    httpGet({
      url: "/eng/prodReAreaItem/findAreaItem",
      params
    }), // 查询工区绑定的分项工程 树形
  findWorkAreaStats: (params = {}) =>
    httpGet({
      url: "/eng/projProject/findWorkAreaStats",
      params
    }), // 获取当前登录项目部的工区启用禁用状态
  updateWorkAreaStats: (data = {}) =>
    httpPost({
      url: "/eng/prodWorkArea/updateWorkAreaStats?state=" + data.state,
      data
    }), // 修改当前登录项目部的工区启用禁用状态
  // 工程图纸管理
  addDrawing: (data = {}) =>
    httpPost({
      url: "/eng/prodEngineeringDrawing/add",
      data
    }), // 新增工程图纸
  deleteDrawing: (params = {}) =>
    httpDelete({
      url: "/eng/prodEngineeringDrawing/delete",
      params
    }), // 根据ID删除工程图纸
  queryDrawing: (params = {}) =>
    httpGet({
      url: "/eng/prodEngineeringDrawing/findEngineeringDrawingById",
      params
    }), // 根据ID查询工程图纸
  findDrawingsByItemId: (params = {}) =>
    httpGet({
      url: "/production/prodEngineeringDrawing/findDrawingsByItemId",
      params
    }), // 根据ID查询工程图纸
  queryDrawingData: (params = {}) =>
    httpGet({
      url: "/eng/prodEngineeringDrawing/listAll",
      params
    }), // 查询工程图纸全部数据
  conditionQueryDrawing: (params = {}) =>
    httpGet({
      url: "/eng/prodEngineeringDrawing/searchPage",
      params
    }), // 根据条件查询工程图纸，分页展示
  findProdReItemDrawingById: (params = {}) =>
    httpGet({
      url: "/eng/prodEngineeringDrawing/findProdReItemDrawingById",
      params
    }), // 根据工程图纸ID查询工程图纸关联数据，带分页
  modifyDrawing: (data = {}) =>
    httpPut({
      url: "/eng/prodEngineeringDrawing/update",
      data
    }), // 根据ID修改工程图纸
  // 项目分部分项细目工程管理
  addSubentry: (data = {}) =>
    httpPost({
      url: "/eng/prodItemList/addAndDeleteItemDrawing",
      data
    }), // 图纸与分项关联数据的新增与删除
  materialsSubentry: (data = {}) =>
    httpPost({
      url: "/production/prodItemList/addAndDeleteItemMaterial",
      data
    }), // 物料与分项关联数据的新增与删除
  addModifyProject: (data = {}) =>
    httpPost({
      url: "/eng/prodItemList/addAndUpdate",
      data
    }), // 新增或修改项目分部分项细目工程
  addAndUpdateDetail: (data = {}) =>
    httpPost({
      url: "/eng/prodItemList/addAndUpdateDetail",
      data
    }), // 新增或者修改细目
  addAndUpdateMaterial: (data = {}) =>
    httpPost({
      url: "/eng/prodItemList/addAndUpdateMaterial",
      data
    }), // 新增或者修改物料
  queriesProject: (params = {}) =>
    httpGet({
      url: "/eng/prodItemList/search",
      params
    }), // 根据条件查询项目分部分项细目工程
  queriesProjectById: (params = {}) =>
    httpGet({
      url: "/eng/prodItemList/searchByProId",
      params
    }), // 根据条件查询项目分部分项细目工程
  searchByProjectId: (params = {}) =>
    httpGet({
      url: "/eng/prodItemList/searchByProjectId",
      params
    }), // 根据项目ID查询分项工程的工程细目 带单价
  searchItems: (params = {}) =>
    httpGet({
      url: "/eng/prodItemList/searchItems",
      params
    }), // 根据项目ID查询分项工程的工程细目 带单价
  baseItemListAll: (params = {}) =>
    httpGet({
      url: "/eng/prodItemList/baseItemListAll",
      params
    }), // 查询所有系统分项工程，树形结构，带工程细目和物料
  // 流程管理
  addProduction: (data = {}) =>
    httpPost({
      url: "/eng/prodProcessApprove/add",
      data
    }), // 新增生产工序流程审批数据
  getEstimate: (data = {}) =>
    httpPost({
      url: "/eng/prodItemList/searchItemsIgnore",
      data
    }), // 新增按钮工程细目不带四级工程细目
  inEstimate: (params = {}) =>
    httpGet({
      url: "/eng/prodProcessApprove/searchProcessByItemId",
      params
    }), // 根据分项工程ID获取对应流程以及付带的所有数据集（流程节点、表格和资料）
  initiator: (params = {}) =>
    httpGet({
      url: "/eng/prodWorkArea/searchUserForOrgId",
      params
    }), // 根据当前登录者组织id查询下属所有员工集
  // getstaffList: (params = {}) =>
  //   httpGet({
  //     url: "/eng/prodProcessApprove/findUserListByWorkflowId",
  //     params
  //   }), // 根据流程主键id获取员工列表
  findByProOrg: (params = {}) =>
    httpGet({
      url: "/eng/prodProcessApprove/findUserListByProOrgId",
      params
    }), // 根据当前登录项目部ID获取流程发起人列表
  deleteProduction: (params = {}) =>
    httpDelete({
      url: "/eng/prodProcessApprove/delete",
      params
    }), // 根据ID删除生产工序流程审批
  deleteProduction2: (data = {}) =>
    httpPut({
      url: "/eng/prodProcessApprove/clearProcessData",
      data
    }), // 根据ID清除生产工序流程审批
  queryProduction: (params = {}) =>
    httpGet({
      url: "/eng/prodProcessApprove/findProcessApproveById",
      params
    }), // 根据ID查询生产工序流程审批数据
  queryApprovalFlow: (params = {}) =>
    httpGet({
      url: "/eng/prodProcessApprove/searchPage",
      params
    }), // 根据条件查询生产工序流程审批，分页展示
  modifyProduction: (data = {}) =>
    httpPut({
      url: "/eng/prodProcessApprove/update",
      data
    }), // 根据ID修改生产工序流程审批数据
  withdrawFlow: (data = {}) =>
    httpPut({
      url: "/eng/prodProcessApprove/withdrawalProcessingNode",
      data
    }), // 撤回流程节点
  handleFlow: (data = {}) =>
    httpPut({
      url: "/eng/prodProcessApprove/processingNodeApproval",
      data
    }), // 处理流程节点
  searchCompleteItemName: (params = {}) =>
    httpPut({
      url: "/eng/prodProcessApprove/searchCompleteItemName",
      params
    }), // 根据施工进尺和原分项工程名称生成新分项工程名称
  searchItemMaterial: (params = {}) =>
    httpGet({
      url: "/eng/prodItemList/searchItemMaterial",
      params
    }), // 查询分项材料表
  searchItemListMaterialTypeTree: (params = {}) =>
    httpGet({
      url: "/eng/prodItemList/searchItemListMaterialTypeTree",
      params
    }), // 获取已选择的系统材料树
  searchAllowableMaterials: (params = {}) =>
    httpGet({
      url: "/eng/prodItemList/searchAllowableMaterials",
      params
    }), // 获取可以选择的物料

  // 合同管理==========================所有公用=======================================
  addContract: (data = {}) =>
    httpPost({
      url: "/eng/projContract/add",
      data
    }), // 新增合同
  editContractById: (data = {}) =>
    httpPut({
      url: "/eng/projContract/update",
      data
    }), // 根据ID修改合同信息
  getContractPageListByCondition: (params = {}) =>
    httpGet({
      url: "/eng/projContract/searchPage",
      params
    }), // 根据条件查询合同，分页展示
  searchDetailByProIdAndType: (params = {}) =>
    httpGet({
      url: "/eng/projContract/searchDetailByProIdAndType",
      params
    }), // 根据项目ID和合同类型查询合同绑定的清单与分项工程关联数据
  itemListAllByDetailId: (params = {}) =>
    httpGet({
      url: "/eng/projContract/itemListAllByDetailId",
      params
    }), // 查询合同清单里所有生产模块分项工程细目集
  getContractInfoById: (params = {}) =>
    httpGet({
      url: "/eng/projContract/findContractById",
      params
    }), // 根据ID查询合同信息
  delContractById: (params = {}) =>
    httpDelete({
      url: "/eng/projContract/delete",
      params
    }), // 根据部门主键id删除部门
  terminationConstant: (params = {}) =>
    httpPut({
      url: "/eng/projContract/terminationConstant",
      params
    }), // 根据ID终止合同
  searchMaterialDetail: (params = {}) =>
    httpGet({
      url: "/eng/projContract/searchMaterialDetail",
      params
    }), // 新增物料清单时可供选择的物料集 树形
  listAllAndMaterial: (params = {}) =>
    httpGet({
      url: "/eng/projContract/listAllAndMaterial",
      params
    }), // 查询物料分类全部数据带物料数据
  searchContentMaterialPage: (params = {}) =>
    httpGet({
      url: "/operation/material/searchPage",
      params
    }), // 查询物料分类全部数据带物料数据
  searchTemporaryItem: (params = {}) =>
    httpGet({
      url: "/eng/projContract/searchTemporaryItem",
      params
    }), // 根据合同类型、合同ID、客户ID和当前登录项目部ID查询临时分项工程树形数据集
  searchItemDetailByOrgId: (params = {}) =>
    httpGet({
      url: "/eng/projContract/searchItemDetailByOrgId",
      params
    }), // 查询合同清单里符合条件的分项工程细目数据集
  searchContractItems: (params = {}) =>
    httpGet({
      url: "/eng/projContract/searchContractItems",
      params
    }), // 查询合同清单里符合条件的分项工程细目数据集
  // 进度管理=================================================================
  // 年度计划月度计划季度计划
  addOrUpdatePlan: (data = {}) =>
    httpPut({
      url: "/eng/projPlan/updatePlan",
      data
    }), // 修改进度计划
  getPlanByProjectId: (params = {}) =>
    httpGet({
      url: "/eng/projPlan/findPlanByProjectId",
      params
    }), // 根据ID查询进度计划及对应的计划明细
  getPlanAndDetailByCondition: (params = {}) =>
    httpGet({
      url: "/eng/projPlan/searchPlanAndDetail",
      params
    }), // 根据条件查询计划及计划明细
  addAndUpdatePlanDetail: (data = {}) =>
    httpPut({
      url: "/eng/projPlan/addAndUpdatePlanDetail",
      data
    }), // 新增或修改进度计划时先把计划明细保存

  // 实际完成
  getFinishRecordById: (params = {}) =>
    httpGet({
      url: "/eng/statsItemFinishRecord/completedNumber",
      params
    }), // 根据项目ID查询每月完成工程量或产值
  getStatsItemFinishRecordByCondition: (params = {}) =>
    httpGet({
      url: "/eng/statsItemFinishRecord/search",
      params
    }), // 根据条件查询分项工程完成记录
  searchActual: (params = {}) =>
    httpGet({
      url: "/eng/statsItemFinishRecord/searchActual",
      params
    }), // 根据条件查询实际完成
  searchStatsItemFinishByProOrgId: (params = {}) =>
    httpGet({
      url: "/eng/statsItemFinishRecord/searchStatsItemFinishByProOrgId",
      params
    }), // 根据当前登录项目部ID查询分项工程列表或工程细目
  searchStatsItemFinishByPkId: (params = {}) =>
    httpGet({
      url: "/eng/statsItemFinishRecord/searchStatsItemFinishByPkId",
      params
    }), // 根据当前登录项目部ID查询分项工程列表或工程细目
  // 进度汇总
  getScheduleAndSumByCondition: (params = {}) =>
    httpGet({
      url: "/eng/statsItemFinishRecord/searchSummary",
      params
    }), // 根据条件查询进度和结算汇总
  searchMeteringSummary: (params = {}) =>
    httpGet({
      url: "/eng/statsItemFinishRecord/searchMeteringSummary",
      params
    }), // 根据条件查询进度和结算汇总
  getBySpecial: (params = {}) =>
    httpGet({
      url: "/eng/public/getBySpecial",
      params
    }), // 获取当前登录组织的特殊数值
  // 质量管理=================================================================
  // 质量同步
  // 安全管理=================================================================
  // 安全同步
  // 结算管理=================================================================
  // 业主计量、项目结算、分包计价、结算汇总
  addStatsProject: (data = {}) =>
    httpPost({
      url: "/eng/statsProjectSettle/add",
      data
    }), // 新增工程结算
  getStatsProjectPageListByCondition: (params = {}) =>
    httpGet({
      url: "/eng/statsProjectSettle/searchPage",
      params
    }), // 根据条件查询工程结算，分页展示
  getSettleWorkflowTable: (params = {}) =>
    httpGet({
      url: "/eng/statsProjectSettle/getWorkflowTable",
      params
    }), // 获取结算的表格
  updateStatsProjectById: (data = {}) =>
    httpPut({
      url: "/eng/statsProjectSettle/update",
      data
    }), // 根据ID修改工程结算
  getStatsProjectById: (params = {}) =>
    httpGet({
      url: "/eng/statsProjectSettle/findStatsProjectSettleById",
      params
    }), // 根据ID查询工程结算
  delStatsProjectById: (params = {}) =>
    httpDelete({
      url: "/eng/statsProjectSettle/delete",
      params
    }), // 根据ID删除工程结算
  getSettlementFront: (params = {}) =>
    httpGet({
      url: "/eng/statsProjectSettle/addSettlementFront",
      params
    }), // 根据当前登录组织ID以及结算对象ID查询新增结算前置条件
  projectExamine: (data = {}) =>
    httpPut({
      url: "/eng/statsProjectSettle/projectExamine",
      data
    }), // 项目结算-审批
  projectQuerySettleInfo: (params = {}) =>
    httpGet({
      url: "/eng/statsProjectSettle/projectQuerySettleInfo",
      params
    }), // 项目结算-查看审批
  // findUserListByType: (params = {}) =>
  //   httpGet({
  //     url: "/eng/statsProjectSettle/findUserListByType",
  //     params
  //   }), // 根据结算类型获取员工列表
  findUserListByWorkflowIdSettle: (params = {}) =>
    httpGet({
      url: "eng/statsProjectSettle/findUserListByWorkflowId",
      params
    }), // 查询结算下一节点审批人
  withdrawalProcessingNode: (data = {}) =>
    httpPut({
      url: "/eng/statsProjectSettle/withdrawalProcessingNode",
      data
    }), // 项目结算-查看审批
  searchSettleByFlowCaseId: (params = {}) =>
    httpGet({
      url: "/eng/statsProjectSettle/searchSettleByFlowCaseId",
      params
    }), // 根据实例id集合查询结算审核申请记录
  searchCustomByProOrgId: (params = {}) =>
    httpGet({
      url: "/eng/statsProjectSettle/searchCustomByProOrgId",
      params
    }), // 新增分包计价结算时，查询关联的分包单位集

  // 地区管理
  getAreaList: (params = {}) =>
    httpGet({
      url: "/operation/sysArea/areaList",
      params
    }), // 地区列表
  getCityList: (params = {}) =>
    httpGet({
      url: "/operation/sysArea/cityList",
      params
    }), // 市级列表
  getCountryList: (params = {}) =>
    httpGet({
      url: "/operation/sysArea/countryList",
      params
    }), // 国家列表
  getProvinceList: (params = {}) =>
    httpGet({
      url: "/operation/sysArea/provinceList",
      params
    }), // 省份列表

  // 文件上传管理
  getUploadFileToken: (params = {}) =>
    httpGet(
      {
        url: "/eng/file/temporary/token"
      },
      params
    ), // 获取图片上传临时token
  uploadFile: (data = {}) =>
    httpPost({
      url: "/eng/file/upload/picture",
      data
    }), // 图片上传
  delFile: (params = {}) =>
    httpDelete({
      url: "/eng/file/delete/picture",
      params
    }), // 删除图片

  // 系统日志管理
  // 菜单管理
  // 获取路由在最顶部
  getOftenRouters: (params = {}) =>
    httpGet({
      url: "/operation/sysMenu/getOftenRouters",
      params
    }), // 获取常用功能菜单资源
  setOftenRouters: (params = {}) =>
    httpPut({
      url: "/operation/sysMenu/oftenMenu",
      params
    }), // 设置常用功能

  // 工程类型管理=================================================================

  searchTypeList: (params = {}) =>
    httpGet({
      url: "/operation/sysEnginerringType/searchTypeList",
      params
    }), // 查询工程类型列表

  // 首页管理
  searchBacklogPageList: (params = {}) =>
    httpGet({
      url: "/operation/home/searchBacklogPageList",
      params
    }), // 待办事项分页列表
  searchDoneItemsPageList: (params = {}) =>
    httpGet({
      url: "/operation/home/searchDoneItemsPageList",
      params
    }), // 已办事项分页列表
  searchNoAdminBacklogPageList: (params = {}) =>
    httpGet({
      url: "/eng/home/searchBacklogPageList",
      params
    }), // 非运营商待办事项分页列表
  searchNoAdminDoneItemsPageList: (params = {}) =>
    httpGet({
      url: "/eng/home/searchDoneItemsPageList",
      params
    }), // 非运营商已办事项分页列表
  getIsDoneTaskDetail: (params = {}) =>
    httpGet({
      url: "/eng/home/getDoneTaskDetail",
      params
    }), // 获取已办详情数据
  findSealDetail: (params = {}) =>
    httpGet({
      url: "/eng/workflowSeal/findSealDetail",
      params
    }), // 获取签章详情
  abnormalMatterSearchPage: (params = {}) =>
    httpGet({
      url: "/operation/home/abnormalMatterSearchPage",
      params
    }), // 异常待办调整分页查询
  searchMatterUsers: (params = {}) =>
    httpGet({
      url: "/operation/home/searchUsers",
      params
    }), // 根据流程待办主键Id查询员工列表
  updateMatter: (data = {}) =>
    httpPut({
      url: "/operation/home/update",
      data
    }), // 根据ID修改异常待办
  abnormalMatterSearchPageNoMaster: (params = {}) =>
    httpGet({
      url: "/eng/home/abnormalMatterSearchPage",
      params
    }), // 异常待办调整分页查询非运营商
  searchMatterUsersNoMaster: (params = {}) =>
    httpGet({
      url: "/eng/home/searchUsers",
      params
    }), // 根据流程待办主键Id查询员工列表非运营商
  updateMatterNoMaster: (data = {}) =>
    httpPut({
      url: "/eng/home/update",
      data
    }), // 根据ID修改异常待办非运营商
  findWebsiteList: (params = {}) =>
    httpPost({
      url: "/operation/systemTool/findWebsiteList",
      params
    }), // 获取常用网址列表
  addWebsite: (data = {}) =>
    httpPost({
      url: `/operation/systemTool/addWebsite?websiteUrl=${data.websiteUrl}&websiteName=${data.websiteName}`,
      data
    }), // 新增常用网址
  deleteWebsite: (params = {}) =>
    httpDelete({
      url: "/operation/systemTool/deleteWebsite",
      params
    }), // 删除常用网址
  findCurrencyList: (params = {}) =>
    httpGet({
      url: "/operation/systemTool/findCurrencyList",
      params
    }), // 实时汇率-获取支持的货币编号列表
  findCurrencyExchangeRate: (params = {}) =>
    httpGet({
      url: "/operation/systemTool/findCurrencyExchangeRate",
      params
    }), // 实时汇率-查看指定货币编号的汇率信息
  findCityWeatherForecast: (params = {}) =>
    httpGet({
      url: "/operation/systemTool/findCityWeatherForecast",
      params
    }), // 全国天气查询-获取特定城市今天及未来天气信息
  findCityWeatherToday: (params = {}) =>
    httpGet({
      url: "/operation/systemTool/findCityWeatherToday",
      params
    }), // 全国天气查询-获取特定城市今日天气信息
  acceptArticleAppoint: (params = {}) =>
    httpPut({
      url: "/eng/oaArticle/acceptArticleAppoint",
      params
    }), // 项目结算-审批
  contractSign: (params = {}) =>
    httpPut({
      url: "/eng/labourContract/contractSign",
      params
    }), // 根据合同ID签署/解约合同
  // 质量管理和安全管理
  searchQualityAndSecurity: (params = {}) =>
    httpGet({
      url: "/eng/statsItemFinishRecord/searchQualityAndSecurity",
      params
    }), // 根据条件查询质量与安全管理
  getOneQualityAndSecurityByItemId: (params = {}) =>
    httpGet({
      url: "/eng/prodProcessApprove/getOneQualityAndSecurityByItemId",
      params
    }), // 根据分项工程ID查询质量与安全检查详情
  getOneQualityAndSecurityByItemIdAndActivityId: (params = {}) =>
    httpGet({
      url: "/eng/prodProcessApprove/getOneQualityAndSecurityByItemIdAndActivityId",
      params
    }), // 根据分项工程ID查询质量与安全检查详情的审批记录
  getDoneTaskDetail: (params = {}) =>
    httpGet({
      url: "/eng/prodProcessApprove/getDoneTaskDetail",
      params
    }), // 获取任务办理详情
  // 获取新增流程审批角色
  searchSysAuditRole: (params = {}) =>
    httpGet({
      url: "/operation/workflow/searchSysAuditRole",
      params
    }),

  liuchenfenxib: (params = {}) =>
    httpGet({
      url: "/operation/itemList/baseItemListsAllByEngTypeId",
      params
    }), // 流程分项表

  searchMajorTypeList: (params = {}) =>
    httpGet({
      url: "/operation/sysEnginerringType/searchMajorTypeList",
      params
    }), // 专业级别
  searchMajorTypeListByContent: (params = {}) =>
    httpGet({
      url: "/eng/projContract/searchMajorTypeList",
      params
    }), // 查询专业类别下拉列表并根据合同所需分项工程集过滤
  searchItemsByOrgId: (params = {}) =>
    httpGet({
      url: "/eng/prodItemList/searchItemsByOrgId",
      params
    }), // 根据当前登录项目部ID查询分项工程的工程细目

  searchOrgList: (params = {}) =>
    httpGet({
      url: "/operation/sysOrg/searchOrgList",
      params
    }), // 组织列表

  switchWorkflowTemplate: (params = {}) =>
    httpGet({
      url: "/eng/prodItemList/switchWorkflowTemplate",
      params
    }), // 修改分项流程的流程id
  //= =======================菜单管理================================================//
  menuGetsearchPage: (params = {}) =>
    httpGet({
      url: "/operation/sysMenu/searchPage",
      params
    }), // 系统菜单列表
  findMenuById: (params = {}) =>
    httpGet({
      url: "/operation/sysMenu/findMenuById",
      params
    }), // 系统菜单列表
  sysMenuAdd: (data = {}) =>
    httpPost({
      url: "/operation/sysMenu/add",
      data
    }), // 新增系统菜单
  sysMenuUpdate: (data = {}) =>
    httpPut({
      url: "/operation/sysMenu/update",
      data
    }), // 修改系统菜单
  allListByThree: (params = {}) =>
    httpGet({
      url: "/operation/sysMenu/allListByThree",
      params
    }), // 系统菜单列表
  sysMenuDelete: (params = {}) =>
    httpDelete({
      url: "/operation/sysMenu/delete",
      params
    }), // 删除菜单

  //= =========================定制权限=======================================//
  sysOrgSelectAllOrg: (params = {}) =>
    httpGet({
      url: "/operation/sysOrg/selectAllOrg",
      params
    }), // 查询系统所有商务用户企业
  selectListByOrgId: (params = {}) =>
    httpGet({
      url: "/operation/sysReOrgMenu/selectListByOrgId",
      params
    }), // 查询系统所有商务用户企业
  sysReOrgMenuAdd: (data = {}) =>
    httpPut({
      url: "/operation/sysReOrgMenu/add",
      data
    }),
  findProdItemListByWorkflowId: (params = {}) =>
    httpGet({
      url: "/eng/prodItemList/findProdItemListByWorkflowId",
      params
    }), // 根据流程模板主键id查询项目分项集合
  // ===================================劳务模块 班组管理开始=======================================================
  // 列表查询
  teamsSearchPage: (params = {}) =>
    httpGet({
      url: "/eng/labourTeam/teamsSearchPage",
      params
    }),
  // 列表删除
  teamsDelete: (params = {}) =>
    httpDelete({
      url: "/eng/labourTeam/teamsDelete",
      params
    }),
  // 根据班组ID修改班组
  teamsUpdate: (data = {}) =>
    httpPut({
      url: "/eng/labourTeam/teamsUpdate",
      data
    }),
  //  查询全部班组
  listAll: (params = {}) =>
    httpGet({
      url: "/eng/labourTeam/listAll",
      params
    }),
  // 查询全部班组,排除没有负责人
  listAllByMembers: (params = {}) =>
    httpGet({
      url: "/eng/labourTeam/listAllByMembers",
      params
    }),

  // 根据ID查询班组
  teamsById: (params = {}) =>
    httpGet({
      url: "/eng/labourTeam/teamsById",
      params
    }),
  // 根据项目ID查询班组
  listByProjectId: (params = {}) =>
    httpGet({
      url: "/eng/labourTeam/listByProjectId",
      params
    }),

  // 新增班组
  teamsAdd: (data = {}) =>
    httpPost({
      url: "/eng/labourTeam/teamsAdd",
      data
    }),
  // 新增班组类别
  teamsClassAdd: (data = {}) =>
    httpPost({
      url: "/eng/labourTeam/teamsClassAdd",
      data
    }),
  // 根据班组类别ID删除班组类别
  teamsClassDelete: (params = {}) =>
    httpDelete({
      url: "/eng/labourTeam/teamsClassDelete",
      params
    }),
  // 根据班组类别ID查询班组类别
  teamsByTypeId: (params = {}) =>
    httpGet({
      url: "/eng/labourTeam/teamsClassFindById",
      params
    }),
  // 根据条件查询班组类别，分页展示
  teamsClassSearchPage: (params = {}) =>
    httpGet({
      url: "/eng/labourTeam/teamsClassSearchPage",
      params
    }),
  // 根据班组类别ID修改班组类别
  teamsClassUpdate: (data = {}) =>
    httpPut({
      url: "/eng/labourTeam/teamsClassUpdate",
      data
    }),
  // 根据劳务人员与班组ID查询劳务人员与班组关系数据
  crewFindById: (params = {}) =>
    httpGet({
      url: "/eng/labourTeamMembers/findById",
      params
    }),
  // 根据条件查询劳务人员与班组关系数据，分页展示
  crewSearchPage: (params = {}) =>
    httpGet({
      url: "/eng/labourTeamMembers/searchPage",
      params
    }),
  // 定向邀签分页查询劳务人员接口
  directionalSearchPage: (params = {}) =>
    httpGet({
      url: "/eng/labourTeamMembers/directionalSearchPage",
      params
    }),
  // 根据项目ID获取所有关联的项目标段集
  noProject: (params = {}) => httpGet({ url: "/eng/projProject/allListBidByProId", params }),
  // 获取当前组织的所有项目信息
  getItemListNoUserId: (params = {}) =>
    httpGet({
      url: "/eng/projProject/getItemListNoUserId",
      params
    }),
  // 根据当前登录关联项目集查询关联的分包单位集
  subcontractor: (params = {}) =>
    httpGet({
      url: "/eng/projCustom/searchHaveLinkOrgId",
      params
    }),
  // 获取班组类别下拉
  listAllTeamsClass: (params = {}) =>
    httpGet({
      url: "/eng/labourTeam/listAllTeamsClass",
      params
    }),
  // ===================================劳务模块 班组管理结束=======================================================
  // ===================================劳务模块 劳务信息开始===================================================
  // 根据班组ID查询劳务人员与班组关系数据集
  listByTeamId: (params = {}) =>
    httpGet({
      url: "/eng/labourTeamMembers/listByTeamId",
      params
    }),
  // 根据劳务人员与班组ID查询劳务人员与班组关系数据
  labourServicefindById: (params = {}) =>
    httpGet({
      url: "/eng/labourTeamMembers/findById",
      params
    }),
  // 根据劳务人员与班组ID查询劳务人员与班组关系数据
  setResponsibility: (params = {}) =>
    httpGet({
      url: "/eng/labourTeamMembers/setResponsibility",
      params
    }),
  // 建设单位监理公司，设计院用：根据标段项目查分包单位
  subcontractorList: (params = {}) =>
    httpGet({
      url: "/eng/projCustom/searchByProjectId",
      params
    }),

  // ===================================劳务模块 劳务信息结算===================================================
  // ===================================劳务模块 工资结算管理开始===================================================
  // 根据结算发放ID查询结算发放数据
  findById: (params = {}) =>
    httpGet({
      url: "/eng/labourSettlement/findById",
      params
    }),
  // 根据班组ID查询支付结余数据集、分页展示
  paymentBalanceByTeamId: (params = {}) =>
    httpGet({
      url: "/eng/labourSettlement/paymentBalanceByTeamId",
      params
    }),
  // 条件查询工资支付结余情况
  searchBalance: (params = {}) =>
    httpGet({
      url: "/eng/labourSettlement/searchBalance",
      params
    }),
  // 条件查询工资结算发放情况，分页展示
  rSettlementSearchPage: (params = {}) =>
    httpGet({
      url: "/eng/labourSettlement/searchPage",
      params
    }),
  // 新增结算发放
  payoffAdd: (data = {}) =>
    httpPost({
      url: "/eng/labourSettlement/add",
      data
    }),
  // 修改结算发放
  payoffUpdate: (data = {}) =>
    httpPut({
      url: "/eng/labourSettlement/update",
      data
    }),
  // 工资结算发放删除
  salaryDelete: (params = {}) =>
    httpDelete({
      url: "/eng/labourSettlement/delete",
      params
    }),
  // 修改结算发放
  withdrawSettlement: (params = {}) =>
    httpPut({
      url: "/eng/labourSettlement/withdrawSettlement",
      params
    }),
  // 根据班组ID查询上期末结算金额
  terminalAmountByTeamId: (params = {}) =>
    httpGet({
      url: "/eng/labourSettlement/terminalAmountByTeamId",
      params
    }),

  // ===================================劳务模块 工资结算管理结束===================================================
  // ===================================劳务模块 合同模板开始===================================================
  // 查询合同模板
  pactListAll: (params = {}) =>
    httpGet({
      url: "/eng/labourContractTemplate/listAll",
      params
    }),
  // 条件查询合同模板，分页展示
  contractTemplateList: (params = {}) =>
    httpGet({
      url: "/eng/labourContractTemplate/searchPage",
      params
    }),

  // 查询入职合同模板
  searchByContractType: (params = {}) =>
    httpGet({
      url: "/eng/labourContractTemplate/searchByContractType",
      params
    }),
  // 查询全部合同模板
  allContract: (params = {}) =>
    httpGet({
      url: "/eng/labourContractTemplate/listAll",
      params
    }),
  // 根据ID查询合同模板
  contractFindById: (params = {}) =>
    httpGet({
      url: "/eng/labourContractTemplate/findById",
      params
    }),
  // 修改合同模板启用状态
  updateStatusById: (params = {}) =>
    httpGet({
      url: "/eng/labourContractTemplate/updateStatusById",
      params
    }),
  // 新增合同模板
  contractAdd: (data = {}) =>
    httpPost({
      url: "/eng/labourContractTemplate/add",
      data
    }),
  // 根据ID修改合同模板
  contractupdate: (data = {}) =>
    httpPut({
      url: "/eng/labourContractTemplate/update",
      data
    }),
  // 根据ID删除合同模板
  contractDelete: (params = {}) =>
    httpDelete({
      url: "/eng/labourContractTemplate/delete",
      params
    }),

  // 条件查询劳务合同数据集，分页展示
  projectSearchPage: (params = {}) =>
    httpGet({
      url: "/eng/labourContract/searchPage",
      params
    }),

  // 根据合同ID查询签署进度
  signScheduleById: (params = {}) =>
    httpGet({
      url: "/eng/labourContract/signScheduleById",
      params
    }),
  // 根据合同ID作废合同
  cancelById: (params = {}) =>
    httpPut({
      url: "/eng/labourContract/cancelById",
      params
    }),
  // 根据合同ID作废合同
  rescindById: (params = {}) =>
    httpPut({
      url: "/eng/labourContract/rescindById",
      params
    }),
  // 根据当前登录组织ID获取管理机构印章页面链接
  accountUrlByOrgId: (params = {}) =>
    httpGet({
      url: "/eng/labourContract/accountUrlByOrgId",
      params
    }),
  // 新增劳动合同
  labourContractAdd: (data = {}) =>
    httpPost({
      url: "/eng/labourContract/add",
      data
    }),
  // 根据当前登录组织ID获取甲方签署人员
  nailUsersByOrgId: (params = {}) =>
    httpGet({
      url: "/eng/labourContract/nailUsersByOrgId",
      params
    }),
  // 根据合同ID获取甲方签署链接
  nailUrlByOrgId: (params = {}) =>
    httpGet({
      url: "/eng/labourContract/nailUrlByOrgId",
      params
    }),
  // ===================================劳务模块 合同模板结束===================================================
  // ===================================劳务模块 保险开始======================================================
  // 保险列表查询
  insuranceSearchPage: (params = {}) =>
    httpGet({
      url: "/eng/labourTeamMembersInsure/searchPage",
      params
    }),
  // 根据ID查询保险
  insuranceFindById: (params = {}) =>
    httpGet({
      url: "/eng/labourTeamMembersInsure/findById",
      params
    }),
  // 新增保险
  insuranceAdd: (data = {}) =>
    httpPost({
      url: "/eng/labourTeamMembersInsure/add",
      data
    }),
  // 修改保险
  insuranceUpdate: (data = {}) =>
    httpPut({
      url: "/eng/labourTeamMembersInsure/update",
      data
    }),
  // 删除保险
  insuranceDelete: (params = {}) =>
    httpDelete({
      url: "/eng/labourTeamMembersInsure/delete",
      params
    }),
  // ===================================劳务模块 保险结束===================================================
  // ===================================劳务模块 培训模板结束===================================================
  // 新增培训
  labourTrainAdd: (data = {}) =>
    httpPost({
      url: "/eng/labourTrain/add",
      data
    }),
  // 删除培训
  labourTrainDelete: (params = {}) =>
    httpDelete({
      url: "/eng/labourTrain/delete",
      params
    }),
  // 根据ID查询培训
  labourTrainFindById: (params = {}) =>
    httpGet({
      url: "/eng/labourTrain/findById",
      params
    }),
  // 根据条件查询培训，分页展示
  labourTrainSearchPage: (params = {}) =>
    httpGet({
      url: "/eng/labourTrain/searchPage",
      params
    }),
  // 查询所有主讲类型
  speakerTypeAllList: (params = {}) =>
    httpGet({
      url: "/eng/labourTrain/speakerTypeAllList",
      params
    }),
  // 根据ID修改培训
  labourTrainUpdate: (data = {}) =>
    httpPut({
      url: "/eng/labourTrain/update",
      data
    }),
  // ===================================劳务模块 培训模板结束===================================================
  // ===================================认证 开始===================================================
  // 企业或个人获取认证链接
  faceSwiping: (data = {}) =>
    httpPost({
      url: "/eng/enterprise/faceSwiping",
      data
    }),
  userFaceDistinguishState: (params = {}) =>
    httpGet({
      url: "/eng/public/judgeBusinessSuccess",
      params
    }), // 根据业务ID判断业务是否核身成功
  judgeScanCompleted: (params = {}) =>
    httpGet({
      url: "/eng/public/judgeScanCompleted",
      params
    }), // 审批根据业务ID判断业务是否核身成功
  getApproveStatus: (params = {}) => httpGet({ url: "/eng/public/getApproveStatus", params }), // 获取审批流程启用核身状态 0:不认证 1:核身认证 2:签名 3:核身并签名
  getAppSignStatus: (params = {}) => httpGet({ url: "/eng/public/getSignStatus", params }), // 获取审批流程启用签名
  createSign: (data = {}) => httpPost({ url: "/eng/public/createSign", data }), // 生成签名 返回签名主键
  getSignStatus: (params = {}) => httpGet({ url: "/eng/enterprise/getSignStatus", params }), // 获取签名认证状态

  // ===================================认证 结束===================================================
  // ===================================技术交底===================================================
  // 查询当前登录组织下所有部门列表
  searchDeptList: (params = {}) =>
    httpGet({
      url: "/eng/sysDept/searchDeptList",
      params
    }),
  // 根据标段项目ID查询树形分项工程集
  searchItemsByProjectId: (params = {}) =>
    httpGet({
      url: "/eng/prodItemList/searchItemsByProjectId",
      params
    }),
  // 根据标段项目ID查询树形分项工程集
  searchItemsByProjectId2: (params = {}) =>
    httpGet({
      url: "/eng/statsQualitySafetyDaily/searchItemsByProjectId",
      params
    }),
  // 根据当前登录项目部ID查询建设单位、监理公司和设计院
  searchByCompanies: (params = {}) =>
    httpGet({
      url: "/eng/projCustom/searchByCompanies",
      params
    }),
  // 新增技术交底
  addDisclosure: (data = {}) =>
    httpPost({
      url: "/eng/prodTechnicalDisclosure/add",
      data
    }),
  // 修改技术交底
  updateDisclosure: (data = {}) =>
    httpPut({
      url: "/eng/prodTechnicalDisclosure/update",
      data
    }),
  // 根据ID查询技术交底
  selectDisclosureById: (params = {}) =>
    httpGet({
      url: "/eng/prodTechnicalDisclosure/selectById",
      params
    }),
  // 根据ID删除技术交底
  delDisclosureById: (params = {}) =>
    httpDelete({
      url: "/eng/prodTechnicalDisclosure/delete",
      params
    }),
  // 根据条件查询技术交底，分页展示
  searchDisclosurePage: (params = {}) =>
    httpGet({
      url: "/eng/prodTechnicalDisclosure/searchPage",
      params
    }),
  // 查询当前登录组织下的所有部门和员工
  deptListByOrgId: (params = {}) =>
    httpGet({
      url: "/eng/prodTechnicalDisclosure/deptListByOrgId",
      params
    }),
  // 根据ID接收或撤回技术交底
  updateEnableStatus: (data = {}) =>
    httpPut({
      url: "/eng/prodTechnicalDisclosure/updateEnableStatus",
      data
    }),
  // 抄送技术交底
  copyDisclosure: (data = {}) =>
    httpPost({
      url: "/eng/prodTechnicalDisclosure/copy",
      data
    }),
  // 获取建设单位、监理公司和设计院的所有关联项目部（含下属部门和员工）
  projectListByOrgId: (params = {}) =>
    httpGet({
      url: "/eng/prodTechnicalDisclosure/projectListByOrgId",
      params
    }),
  // 根据当前登录关联项目集查询关联的分包单位集(排除没有下属员工的数据)
  customsContainUsers: (params = {}) =>
    httpGet({
      url: "/eng/projCustom/customsContainUsers",
      params
    }),
  // 抄送时查询当前登录组织下的所有部门和员工
  deptListById: (params = {}) =>
    httpGet({
      url: "/eng/prodTechnicalDisclosure/deptListById",
      params
    }),
  // 待办事件里的根据ID接收技术交底
  updateEnableStatusAndMatter: (params = {}) =>
    httpPut({
      url: "/eng/prodTechnicalDisclosure/updateEnableStatusAndMatter",
      params
    }),
  // ===================================技术交底 结束===================================================
  // ===================================施工日志===================================================
  // 批量新增施工日志数据
  addBatch: (data = {}) =>
    httpPost({
      url: "/eng/prodConstructionJournal/addBatch",
      data
    }),
  // 批量导出
  batchCompress: (params = {}) =>
    httpGet({
      url: "/eng/prodConstructionJournal/batchCompress",
      params
    }),
  // 批量导出
  batchExportFile: (params = {}) =>
    httpGet({
      url: "/eng/prodConstructionJournal/batchExportFile",
      params
    }),
  // 打印文件
  printFile: (params = {}) =>
    httpGet({
      url: "/eng/prodConstructionJournal/printFile",
      params
    }),
  // 根据ID删除施工日志
  deleteJournal: (params = {}) =>
    httpDelete({
      url: "/eng/prodConstructionJournal/delete",
      params
    }),
  // 根据条件查询施工日志
  searchJournal: (params = {}) =>
    httpGet({
      url: "/eng/prodConstructionJournal/search",
      params
    }),
  // 根据条件查询施工日志
  searchPageJournal: (params = {}) =>
    httpGet({
      url: "/eng/prodConstructionJournal/searchPage",
      params
    }),
  // 根据ID查询施工日志数据
  selectJournalById: (params = {}) =>
    httpGet({
      url: "/eng/prodConstructionJournal/selectById",
      params
    }),
  // 查询所有温度列表
  temperatureAllList: (params = {}) =>
    httpGet({
      url: "/eng/prodConstructionJournal/temperatureAllList",
      params
    }),
  // 根据ID修改施工日志数据
  updateJournal: (data = {}) =>
    httpPut({
      url: "/eng/prodConstructionJournal/update",
      data
    }),
  // 查询所有天气状态
  weatherStatsAllList: (params = {}) =>
    httpGet({
      url: "/eng/prodConstructionJournal/weatherStatsAllList",
      params
    }),

  // ===================================施工日志 结束===================================================
  // ===================================质量管理与安全管理 ========================================
  searchByCompanyType: (params = {}) => httpGet({ url: "/eng/projCustom/searchByCompanyType", params }), // 根据当前登录项目部ID和客户类型查询客户名称
  getSearchPage: (params = {}) => httpGet({ url: "/eng/statsQualitySafetyDaily/searchPage", params }), // 根据条件查询质量安全日常管理，分页展示
  inspectTypeAllList: (params = {}) => httpGet({ url: "/eng/statsQualitySafetyDaily/inspectTypeAllList", params }), // 获取安全日常检查类型列表
  addQualitySafety: (data = {}) => httpPost({ url: "/eng/statsQualitySafetyDaily/add", data }), // 新增质量安全日常管理数据
  modifyQualitySafety: (data = {}) => httpPost({ url: "/eng/statsQualitySafetyDaily/update", data }), // 根据ID修改质量安全日常管理数据
  queryQualitySafety: (params = {}) => httpGet({ url: "/eng/statsQualitySafetyDaily/selectById", params }), // 根据ID查询质量安全日常管理数据
  deleteQualitySafety: (params = {}) => httpDelete({ url: "/eng/statsQualitySafetyDaily/delete", params }), // 根据ID删除质量安全日常管理
  editSystemData: (data = {}) => httpPost({ url: "/eng/stats/statsQualitySafetyHierarchy/addAndUpdate", data }), // 新增或修改管理体系数据
  querySystem: (params = {}) => httpGet({ url: "/eng/stats/statsQualitySafetyHierarchy/search", params }), // 根据条件查询管理体系
  deleteSystem: (params = {}) => httpDelete({ url: "/eng/stats/statsQualitySafetyHierarchy/delete", params }), // 根据ID删除管理体系
  getInspection: (params = {}) => httpGet({ url: "/eng/statsQualitySafetyInspect/searchPage", params }), // 根据条件查询上级检查，分页展示
  addInspection: (data = {}) => httpPost({ url: "/eng/statsQualitySafetyInspect/add", data }), // 新增上级检查数据
  editInspection: (data = {}) => httpPut({ url: "/eng/statsQualitySafetyInspect/update", data }), // 根据ID修改上级检查数据
  queryInspection: (params = {}) => httpGet({ url: "/eng/statsQualitySafetyInspect/selectById", params }), // 根据ID查询上级检查数据
  deleteInspection: (params = {}) => httpDelete({ url: "/eng/statsQualitySafetyInspect/delete", params }), // 根据ID删除上级检查
  selectByItemId: (params = {}) => httpGet({ url: "/eng/stats/statsQualityEvaluate/selectByItemId", params }), // 新增评定表前根据分项工程ID查询数据集
  addEvaluate: (data = {}) => httpPost({ url: "/eng/stats/statsQualityEvaluate/add", data }), // 新增质量评定数据
  queryEvaluate: (params = {}) => httpGet({ url: "/eng/stats/statsQualityEvaluate/selectById", params }), // 根据分项工程ID查询质量评定数据
  inquireEvaluateAll: (params = {}) => httpGet({ url: "/eng/stats/statsQualityEvaluate/search", params }), // 根据条件查询质量评定数据集
  editEvaluate: (data = {}) => httpPut({ url: "/eng/stats/statsQualityEvaluate/update", data }), // 根据ID修改质量评定数据
  // ===================================质量管理与安全管理end ========================================
  // ===================================设计变更===================================================
  // 新增或修改变更设计
  addDesign: (data = {}) => httpPost({ url: "/eng/prodChangesDesign/add", data }),
  // 新增或修改变更设计
  updateDesign: (data = {}) => httpPut({ url: "/eng/prodChangesDesign/update", data }),
  // 审批流程
  approvalProcess: (data = {}) => httpPost({ url: "/eng/prodChangesDesign/approvalProcess", data }),
  // 删除设计变更
  deleteDesign: (params = {}) => httpDelete({ url: "/eng/prodChangesDesign/delete", params }),
  // 查询变更类型
  getChangeType: (params = {}) => httpGet({ url: "/eng/prodChangesDesign/getChangeType", params }),
  // 查询合同签署区(按照顺序 第一个是本单位签署的)
  getContractCustom: (params = {}) => httpGet({ url: "/eng/prodChangesDesign/getContractCustom", params }),
  // 查询电子签章
  getSealPerson: (params = {}) => httpGet({ url: "/eng/prodChangesDesign/getSealPerson", params }),
  // 分页查询
  searchPageDesign: (params = {}) => httpGet({ url: "/eng/prodChangesDesign/searchPage", params }),
  // 获取签章链接
  signatureContract: (params = {}) => httpGet({ url: "/eng/prodChangesDesign/signatureContract", params }),
  // 发起签章
  startSeal: (data = {}) => httpPost({ url: "/eng/prodChangesDesign/startSeal", data }),
  // 转交签章
  transSeal: (data = {}) => httpPost({ url: "/eng/prodChangesDesign/transSeal", data }),
  // 撤回流程
  withdrawActivity: (data = {}) => httpPut({ url: "/eng/prodChangesDesign/withdrawActivity", data }),
  // 撤回电子签章
  withdrawSeal: (data = {}) => httpPut({ url: "/eng/prodChangesDesign/withdrawSeal", data }),
  // 查询变更状态字典
  changeStatsQuery: (params = {}) => httpGet({ url: "/eng/prodChangesDesign/changeStatsQuery", params }),
  // 查询详情
  getDesignDetail: (params = {}) => httpGet({ url: "/eng/prodChangesDesign/getDetail", params }),
  // 查询发起人列表
  getCreateUserList: (params = {}) => httpGet({ url: "/eng/prodChangesDesign/getCreateUserList", params }),
  // 获取设计变更的表格
  getDesignWorkflowTable: (params = {}) => httpGet({ url: "/eng/prodChangesDesign/getWorkflowTable", params }),
  // ===================================压缩文件 开始===================================================
  // 压缩文件
  compressFile: (data = {}) => httpPost({ url: "/eng/compress/compressFile", data }),
  // ===================================压缩文件 结束===================================================
  // 流程类型下拉接口
  workTypeQuery: (params = {}) => httpGet({ url: "/operation/workflow/workTypeQuery", params }),
  // 核身认证
  swipingAuthentication: (params = {}) => httpGet({ url: "/eng/enterprise/swipingAuthentication", params }),
  // 项目部查询施工单位是否认证 查询签章人之前的校验 查看单位是否企业认证
  validateBeforeGetSealPerson: (params = {}) => httpGet({ url: "/eng/prodChangesDesign/validateBeforeGetSealPerson", params }),
  // ========================================================物质成本二期新增接口=========================================================
  getItemClass: (params = {}) => httpGet({ url: "/operation/dict/findDictByType", params }), // 字典获取物料分类属性
  findDictAllList: (params = {}) => httpGet({ url: "/operation/dict/findDictAllList", params }), // 字典获取物料分类属性

  // ========================================================设备管理开始=========================================================
  facilitySearchPage: (params = {}) => httpGet({ url: "/eng/projDevice/searchPage", params }), // 根据条件查询设备表分页展示
  projDeviceList: (params = {}) => httpGet({ url: "/eng/projDevice/searchDeptList", params }), // 查询当前登录组织下的所有部门
  projDeviceAdd: (data = {}) => httpPost({ url: "/eng/projDevice/add", data }), // 新增设备表数据
  projDeviceDelete: (params = {}) => httpDelete({ url: "/eng/projDevice/delete", params }), // 根据ID删除设备表
  projDeviceFindById: (params = {}) => httpGet({ url: "/eng/projDevice/findById", params }), // 根据ID查询设备表数据
  projDeviceUpdate: (data = {}) => httpPut({ url: "/eng/projDevice/update", data }), // 根据ID修改设备表数据
  searchByTree: (params = {}) => httpGet({ url: "/operation/deviceClass/searchByTree", params }), // 查询所有设备类别并成树形
  deviceClassAdd: (data = {}) => httpPost({ url: "/operation/deviceClass/add", data }), // 新增设备分类表数据
  deviceClassFindById: (params = {}) => httpGet({ url: "/operation/deviceClass/findById", params }), // 根据ID查询设备分类表数据
  deviceClassUpdate: (data = {}) => httpPut({ url: "/operation/deviceClass/update", data }), // 根据ID修改设备分类表数据
  deviceClassDeleteBatch: (params = {}) => httpDelete({ url: "/operation/deviceClass/deleteBatch", params }), // 根据ID集批量删除设备分类数据集
  baseDeviceTemplate: (params = {}) => httpGet({ url: "/operation/baseDeviceTemplate/searchPage", params }), // 根据条件查询设备模板表
  baseDeviceTemplateAdd: (data = {}) => httpPost({ url: "/operation/baseDeviceTemplate/add", data }), // 新增设备模板表数据
  baseDeviceTemplateDelete: (params = {}) => httpDelete({ url: "/operation/baseDeviceTemplate/deleteBatch", params }), // 根据ID集批量删除设备模板表数据集
  baseDeviceTemplateFindById: (params = {}) => httpGet({ url: "/operation/baseDeviceTemplate/findById", params }), // 根据ID查询设备模板表数据
  baseDeviceTemplateUpdate: (data = {}) => httpPut({ url: "/operation/baseDeviceTemplate/update", data }), // 根据ID修改设备模板表数据

  // ========================================================设备管理结束=========================================================
  // ========================================================财务管理开始=========================================================
  // ========================================================管理成本开始=========================================================

  actualCostAccountList: (params = {}) => httpGet({ url: "/eng/projCostManage/actualCostAccountList", params }), // 条件查询实际成本中的成本核算数据集
  addProCost: (data = {}) => httpPost({ url: "/eng/projCostManage/add", data }), // 新增管理成本表数据
  businessAccountList: (params = {}) => httpGet({ url: "/eng/projCostManage/businessAccountList", params }), // 条件查询责任成本中的成本核算数据集
  delProCost: (params = {}) => httpDelete({ url: "/eng/projCostManage/delete", params }), // 根据ID删除管理成本表
  searchProCostByType: (params = {}) => httpGet({ url: "/eng/projCostManage/search", params }), // 根据条件查询管理成本表
  searchProCostPage: (params = {}) => httpGet({ url: "/eng/projCostManage/searchPage", params }), // 根据条件查询管理成本表，分页展示
  updateProCost: (data = {}) => httpPut({ url: "/eng/projCostManage/update", data }), // 根据ID修改管理成本表数据
  monthSummary: (params = {}) => httpGet({ url: "/eng/projCostManage/monthSummary", params }), // 根据ID修改管理成本表数据
  searchProjCostClass: (params = {}) => httpGet({ url: "/eng/projCostClass/search", params }), // 根据条件查询费用分类表
  addProjCostClass: (data = {}) => httpPost({ url: "/eng/projCostClass/add", data }), // 新增费用分类表数据
  deleteProjCostClass: (params = {}) => httpDelete({ url: "/eng/projCostClass/delete", params }), // 根据ID删除费用分类表
  findProjCostClassById: (params = {}) => httpGet({ url: "/eng/projCostClass/findById", params }), // 根据ID查询费用分类表数据
  updateProjCostClass: (data = {}) => httpPut({ url: "/eng/projCostClass/update", data }), // 根据ID修改费用分类表数据
  addProjCostMaterial: (data = {}) => httpPost({ url: "/eng/projCostMaterial/add", data }), // 新增物资成本表数据
  delProjCostMaterial: (params = {}) => httpDelete({ url: "/eng/projCostMaterial/delete", params }), // 根据ID删除物资成本表
  findProjCostMaterialById: (params = {}) => httpGet({ url: "/eng/projCostMaterial/findById", params }), // 根据ID查询物资成本表数据
  searchProjCostMaterialPage: (params = {}) => httpGet({ url: "/eng/projCostMaterial/searchPage", params }), // 根据条件查询物资成本表，分页展示
  actualCostMaterSearchPage: (params = {}) => httpGet({ url: "/eng/projCostMaterial/actualCostSearchPage", params }), // 根据条件查询实际成本的物资成本，分页展示
  updateProjCostMaterial: (data = {}) => httpPut({ url: "/eng/projCostMaterial/update", data }), // 根据ID修改物资成本表数据
  getMaterialsTree: (params = {}) => httpGet({ url: "/operation/materialType/listAllAndMaterial", params }), // 查询物料分类全部数据带物料数据
  actualDeviceCostSearchPage: (params = {}) => httpGet({ url: "/eng/projDevice/actualCostSearchPage", params }), // 分页查询实际成本的设备成本
  // ========================================================管理成本结束=========================================================
  // ========================================================往来账表开始=========================================================
  addProjFinanceIntercourse: (data = {}) => httpPost({ url: "/eng/projFinanceIntercourse/add", data }), // 新增往来账表数据
  delProjFinanceIntercourse: (params = {}) => httpDelete({ url: "/eng/projFinanceIntercourse/delete", params }), // 根据ID删除往来账表
  findProjFinanceIntercourseById: (params = {}) => httpGet({ url: "/eng/projFinanceIntercourse/findById", params }), // 根据ID查询往来账表数据
  getStatistics: (params = {}) => httpGet({ url: "/eng/projFinanceIntercourse/getStatistics", params }), // 获取统计的各项金额
  searchProjFinanceIntercoursePage: (params = {}) => httpGet({ url: "/eng/projFinanceIntercourse/searchPage", params }), // 根据条件查询往来账表，分页展示
  updateProjFinanceIntercourse: (data = {}) => httpPut({ url: "/eng/projFinanceIntercourse/update", data }), // 根据ID修改往来账表数据
  // ========================================================往来账表结束=========================================================
  // ========================================================物资流水管理结束=========================================================
  materialSettleSearchPage: (params = {}) => httpGet({ url: "/eng/finance/materialSettleSearchPage", params }), // 财务管理-供应商材料结算
  summaryStandSearch: (params = {}) => httpGet({ url: "/eng/finance/summaryStandSearch", params }), // 财务管理-供应商汇总台账
  subCalculatePriceSearchPage: (params = {}) => httpGet({ url: "/eng/finance/subCalculatePriceSearchPage", params }), // 财务管理-分包单位结算-分包计价
  materialDeductSearchPage: (params = {}) => httpGet({ url: "/eng/finance/materialDeductSearchPage", params }), // 财务管理-分包单位结算-物资扣除
  subLedgerAmountSearchPage: (params = {}) => httpGet({ url: "/eng/finance/subLedgerAmountSearchPage", params }), // 财务管理-分包单位结算-汇总台账
  // ========================================================物资流水管理开始=========================================================
  // ========================================================财务管理结束=========================================================
  // ========================================================成本管理开始=========================================================
  costSearchPage: (params = {}) => httpGet({ url: "/eng/projContract/costSearchPage", params }), // 成本管理的分包合同分页查询
  actualCostSearchPage: (params = {}) => httpGet({ url: "/eng/statsProjectSettle/actualCostSearchPage", params }), // 分页查询实际成本的分包成本
  // ========================================================成本管理结束=========================================================
  // ========================================================库存管理开始=========================================================
  getSelfMaterialTypes: (params = {}) => httpGet({ url: "/eng/materialInventory/getSelfMaterialTypes", params }), // 查询仓库下面的物料类型
  // ========================================================仓库信息开始=========================================================
  addWarehouse: (data = {}) => httpPost({ url: "/eng/warehouse/add", data }), // 新增仓库表数据
  delWarehouse: (params = {}) => httpDelete({ url: "/eng/warehouse/delete", params }), // 根据ID删除仓库表
  findWarehouseById: (params = {}) => httpGet({ url: "/eng/warehouse/findById", params }), // 根据ID查询仓库表数据
  findWarehouseByProjectId: (params = {}) => httpGet({ url: "/eng/warehouse/findWarehouseByProjectId", params }), // 根据标段项目id查询仓库列表
  projectWarehouseSearchPage: (params = {}) => httpGet({ url: "/eng/warehouse/projectWarehouseSearchPage", params }), // 标段仓库分页查询
  searchWarehousePage: (params = {}) => httpGet({ url: "/eng/warehouse/searchPage", params }), // 根据条件查询仓库表，分页展示
  toggleRepository: (params = {}) => httpPut({ url: "/eng/warehouse/toggleRepository", params }), // 根据条件查询仓库表，分页展示
  updateWarehouse: (data = {}) => httpPut({ url: "/eng/warehouse/update", data }), // 根据条件查询仓库表，分页展示
  findSelfWarehouse: (params = {}) => httpGet({ url: "/eng/warehouse/findSelfWarehouse", params }), // 根据标段项目id查询仓库列表
  getWarehouseProject: (params = {}) => httpGet({ url: "/eng/warehouse/getWarehouseProject", params }), // 查询标段仓库项目
  // ========================================================仓库信息结束=========================================================
  // ========================================================物料库存预警开始=========================================================
  addMaterialInventoryAlert: (data = {}) => httpPost({ url: "/eng/materialInventoryAlert/add", data }), // 新增物料库存预警数据
  delMaterialInventoryAlert: (params = {}) => httpDelete({ url: "/eng/materialInventoryAlert/delete", params }), // 根据ID删除物料库存预警
  findMaterialInventoryAlertById: (params = {}) => httpGet({ url: "/eng/materialInventoryAlert/findById", params }), // 根据ID查询物料库存预警数据
  getMaterials: (params = {}) => httpGet({ url: "/eng/materialInventoryAlert/getMaterials", params }), // 查询物料
  getMaterialsInventory: (params = {}) => httpGet({ url: "/eng/materialInventoryAlert/getMaterialsInventory", params }), // 查询物料物料库存
  searchMaterialInventoryAlertPage: (params = {}) => httpGet({ url: "/eng/materialInventoryAlert/searchPage", params }), // 根据条件查询物料库存预警，分页展示
  updateMaterialInventoryAlert: (data = {}) => httpPut({ url: "/eng/materialInventoryAlert/update", data }), // 根据ID修改物料库存预警数据
  // ========================================================物料库存预警结束=========================================================
  // ========================================================库存信息开始=========================================================
  searchMaterialInventoryPage: (params = {}) => httpGet({ url: "/eng/materialInventory/searchPage", params }), // 根据条件查询仓库与物料库存表，分页展示
  changeRecordSearchPage: (params = {}) => httpGet({ url: "/eng/materialInventory/changeRecordSearchPage", params }), // 查询变动记录
  materialLedgerSearchPage: (params = {}) => httpGet({ url: "/eng/materialInventory/materialLedgerSearchPage", params }), // 查询物料台账
  materialAccountSearchPage: (params = {}) => httpGet({ url: "/eng/materialAccount/searchPage", params }), // 根据条件查询物资台账表，分页展示
  materialTypeLedgerSearchPage: (params = {}) => httpGet({ url: "/eng/materialInventory/materialTypeLedgerSearchPage", params }), // 查询物料类型台账
  // ========================================================库存信息结束=========================================================
  // ========================================================盘点管理开始=========================================================
  addOrderInventory: (data = {}) => httpPost({ url: "/eng/orderInventory/add", data }), // 新增物资盘点单数据
  approvalOrderInventory: (data = {}) => httpPut({ url: "/eng/orderInventory/approvalProcess", data }), // 审批流程
  delOrderInventory: (params = {}) => httpDelete({ url: "/eng/orderInventory/delete", params }), // 根据ID删除物资盘点单
  findOrderInventoryById: (params = {}) => httpGet({ url: "/eng/orderInventory/findById", params }), // 根据ID查询物资盘点单数据
  // findUserList: (params = {}) => httpGet({ url: "/eng/orderInventory/findUserList", params }), // 提交审批时获取员工列表
  getOrderInventoryProcess: (params = {}) => httpGet({ url: "/eng/orderInventory/getOrderInventoryProcess", params }), // 查询盘点单流程
  getWarehouseMaterial: (params = {}) => httpGet({ url: "/eng/orderInventory/getWarehouseMaterial", params }), // 查询库存物料
  searchOrderInventoryPage: (params = {}) => httpGet({ url: "/eng/orderInventory/searchPage", params }), // 根据条件查询物资盘点单，分页展示
  updateOrderInventory: (data = {}) => httpPut({ url: "/eng/orderInventory/update", data }), // 根据ID修改物资盘点单数据
  recallOrderInventory: (data = {}) => httpPut({ url: "/eng/orderInventory/withdrawActivity", data }), // 撤回流程
  getApproveMaterials: (params = {}) => httpGet({ url: "/eng/orderInventory/getApproveMaterials", params }), // 撤回流程
  // findNextUserOrderInv: (params = {}) => httpGet({ url: "/eng/orderInventory/findNextUser", params }), // 查询下一个节点审批人
  // ========================================================盘点管理结束=========================================================
  // ========================================================出入库管理开始=========================================================
  findOrderInputByWarehouseId: (params = {}) => httpGet({ url: "/eng/inventory/findOrderInputByWarehouseId", params }), // 根据查询条件获取入库单列表-出库时使用
  findOrderOutByWarehouseId: (params = {}) => httpGet({ url: "/eng/inventory/findOrderOutByWarehouseId", params }), // 根据查询条件获取出库单列表-入库时使用-来料对象为无时使用
  findOrderApplyByInputId: (params = {}) => httpGet({ url: "/eng/orderApply/findOrderApplyByInputId", params }), // 根据入库单id和申请单编码获取物资申请单列表
  addPutInventory: (data = {}) => httpPost({ url: "/eng/inventory/input/add", data }), // 新增入库单
  delPutInventory: (params = {}) => httpDelete({ url: "/eng/inventory/input/delete", params }), // 根据id删除入库单
  findInputById: (params = {}) => httpGet({ url: "/eng/inventory/input/findInputById", params }), // 根据入库单主键id查询单据信息
  searchPutInventoryPage: (params = {}) => httpGet({ url: "/eng/inventory/input/searchPage", params }), // 入库单分页列表
  updatePutInventory: (data = {}) => httpPut({ url: "/eng/inventory/input/update", data }), // 编辑入库单
  checkPutInventory: (data = {}) => httpPut({ url: "/eng/inventory/input/check", data }), // 检测入库单
  inputWarehousing: (params = {}) => httpPut({ url: "/eng/inventory/input/warehousing", params }), // 入库单入库
  handlePutInventory: (data = {}) => httpPut({ url: "/eng/inventory/input/handle", data }), // 处理入库单
  retreatPutInventoryNoOut: (data = {}) => httpPut({ url: "/eng/inventory/input/currency/retreat", data }), // 入库单退货-已签收未入库退货-通用
  retreatPutInventorySub: (data = {}) => httpPut({ url: "/eng/inventory/input/subcontract/retreat", data }), // 入库单退货-分包单位已入库退货
  retreatPutInventoryPro: (data = {}) => httpPut({ url: "/eng/inventory/input/project/retreat", data }), // 入库单退货-项目部已入库通用退货版
  retreatPutInventoryNoInput: (data = {}) => httpPut({ url: "/eng/inventory/input/subcontract/unsigned/retreat", data }), // 入库单退货-未签收分包单位原路退回
  addOutInventory: (data = {}) => httpPost({ url: "/eng/inventory/out/add", data }), // 新增出库单
  delOutInventory: (params = {}) => httpDelete({ url: "/eng/inventory/out/delete", params }), // 新增入库单
  findOutById: (params = {}) => httpGet({ url: "/eng/inventory/out/findOutById", params }), // 根据入库单主键id查询单据信息
  searchOutInventoryPage: (params = {}) => httpGet({ url: "/eng/inventory/out/searchPage", params }), // 出库单分页列表
  updateOutInventory: (data = {}) => httpPut({ url: "/eng/inventory/out/update", data }), // 编辑出库单
  findProjectListByType: (params = {}) => httpGet({ url: "/eng/projProject/findProjectListByType", params }), // 根据类型获取标段项目列表信息
  searchProjCustomByType: (params = {}) => httpGet({ url: "/eng/projCustom/searchProjCustomByType", params }), // 根据标段查询以及客户类型查询客户信息
  findInputByOrderCode: (params = {}) => httpGet({ url: "/eng/inventory/input/findInputByOrderCode", params }), // 根据入库单编码查询单据信息
  findInputDetectionInfoById: (params = {}) => httpGet({ url: "/eng/inventory/input/findInputDetectionInfoById", params }), // 根据入库单主键id查询检测信息
  enterInfo: (data = {}) => httpPost({ url: "/eng/inventory/out/enterInfo", data }), // 根据出库单id，录入签收信息
  // ========================================================出入库管理结束=========================================================
  // ========================================================甲供库存结束=========================================================
  firstSupplySearchPage: (params = {}) => httpGet({ url: "/eng/materialInventory/firstSupplySearchPage", params }), // 甲供库存分页列表
  firstChangeRecordSearchPage: (params = {}) => httpGet({ url: "/eng/materialInventory/firstChangeRecordSearchPage", params }), // 甲供库存查询变动记录
  findCustomWarehouse: (params = {}) => httpGet({ url: "/eng/warehouse/findCustomWarehouse", params }), // 根据客户id查询仓库
  // ========================================================甲供库存结束=========================================================
  // ========================================================库存管理结束=========================================================

  //= ======================================================= 物资管理 ===========================================================
  getBusinessCode: (params = {}) => httpGet({ url: "/eng/public/getBusinessCode", params }), // 根据业务类型获取业务单号
  searchMaterialPage: (params = {}) => httpGet({ url: "/eng/public/searchMaterialPage", params }), // 根据当前登录组织分页查询指定来源物料数据集
  addApplicationform: (data = {}) => httpPost({ url: "/eng/orderApply/add", data }), // 新增物资申请单数据
  editApplicationform: (data = {}) => httpPut({ url: "/eng/orderApply/update", data }), // 根据ID修改物资申请单数据
  queryApplicationform: (params = {}) => httpGet({ url: "/eng/orderApply/findById", params }), // 根据ID查询物资申请单数据
  deleteApplicationform: (params = {}) => httpDelete({ url: "/eng/orderApply/delete", params }), // 根据ID删除物资申请单
  pageApplicationform: (params = {}) => httpGet({ url: "/eng/orderApply/searchPage", params }), // 根据条件查询物资申请单，分页展示
  getAPPlicationformData: (params = {}) => httpGet({ url: "/eng/orderApply/searchByProjectOrgId", params }), // 根据当前登录项目部ID查询物资申请单数据集
  modifyState: (data = {}) => httpPut({ url: "/eng/orderApply/updateApplyCodeByBusinessType", data }), // 根据主键ID和业务类型修改物资申请单状态
  getClientData: (params = {}) => httpGet({ url: "/eng/projCustom/searchHaveLinkOrgId", params }), // 根据当前登录关联项目集查询关联的客户集
  // 物资采购
  searchNoLinkOrgId: (params = {}) => httpGet({ url: "/eng/projCustom/searchNoLinkOrgId", params }), // 项目集查询关联的客户集 关联公司ID不一定非空
  searchCustomNoLinkOrgId: (params = {}) => httpGet({ url: "/eng/projCustom/searchCustomNoLinkOrgId", params }), // 根据当前登录关联项目集查询关联的客户集 关联公司ID不一定非空
  addPurchaseOrder: (data = {}) => httpPost({ url: "/eng/orderPurchase/add", data }), // 新增物资采购单数据
  editPurchaseOrder: (data = {}) => httpPut({ url: "/eng/orderPurchase/update", data }), // 根据ID修改物资采购单数据
  getPurchaseOrder: (params = {}) => httpGet({ url: "/eng/orderPurchase/searchPage", params }), // 根据条件查询物资采购单，分页展示
  findPurchaseOrderByProjectId: (params = {}) => httpGet({ url: "/eng/orderPurchase/findPurchaseOrderByProjectId", params }), // 采购计划单
  getOrderApply: (params = {}) => httpGet({ url: "/eng/orderApply/findOrderApplyByCustomerId", params }), // 根据客户id和申请单编码获取物资申请单列表
  queryPurchaseOrder: (params = {}) => httpGet({ url: "/eng/orderPurchase/findById", params }), // 根据ID查询物资采购单数据
  deletePurchaseOrder: (params = {}) => httpDelete({ url: "/eng/orderPurchase/delete", params }), // 根据ID删除物资采购单
  modifyPurchaseOrderState: (data = {}) => httpPut({ url: "/eng/orderPurchase/updateOrderPurchaseByBusinessType", data }), // 根据ID、类型改采购单状态
  // 物资结算
  subcontractorDeduction: (params = {}) => httpGet({ url: "/eng/settleMaterial/materialDeductSearchPage", params }), // 分包单位扣款
  settlementSuppliers: (params = {}) => httpGet({ url: "/eng/settleMaterial/materialSettleSearchPage", params }), // 供应商结算
  // 普通材料发料单
  addOrderOrdinaryApply: (data = {}) => httpPost({ url: "/eng/orderOrdinaryApply/add", data }), // 新增普通材料发料单
  orderOrdinaryApplyDelete: (params = {}) => httpDelete({ url: "/eng/orderOrdinaryApply/delete", params }), // 根据ID删除普通材料发料单表
  orderOrdinaryApplyById: (params = {}) => httpGet({ url: "/eng/orderOrdinaryApply/findById", params }), // 根据ID查询普通材料发料单
  findOrderOrdinaryByWarehouseId: (params = {}) => httpGet({ url: "/eng/orderOrdinaryApply/findOrderOrdinaryByWarehouseId", params }), // 根据条件查询普通材料发料单表
  orderOrdinaryApplySearchPage: (params = {}) => httpGet({ url: "/eng/orderOrdinaryApply/searchPage", params }), // 根据条件查询普通材料发料单表，分页展示
  orderOrdinaryApplyUpdate: (data = {}) => httpPut({ url: "/eng/orderOrdinaryApply/update", data }), // 根据ID修改普通材料发料单
  updateOrdinaryApplyByBusinessType: (data = {}) => httpPut({ url: "/eng/orderOrdinaryApply/updateOrdinaryApplyByBusinessType", data }), // 根据主键ID和业务类型修改普通材料发料单状态
  // 物资总需求
  searchMaterialTypesByProjectId: (params = {}) => httpGet({ url: "/eng/public/searchMaterialTypesByProjectId", params }), // 查询项目关联分项工程关联物料分类数据集(带下属物料数据集)
  searchMaterialTypeByProjectId: (params = {}) => httpGet({ url: "/eng/public/searchMaterialTypeByProjectId", params }), // 查询项目关联分项工程关联物料分类数据集(不带下属物料数据集)
  searchItemMaterialTypes: (params = {}) => httpGet({ url: "/eng/public/searchItemMaterialTypes", params }), // 物资总需求按工区和按分包单位(带下属物料分类和物料数据集)
  //= ======================================================= 物资管理结束 ===========================================================
  findUserByTelephone: (params = {}) => httpGet({ url: "/auth/findUserByTelephone", params }), // 根据手机号获取账号列表
  getAuthInfo: (params = {}) => httpGet({ url: "/eng/enterprise/getAuthInfo", params }), // 获取认证信息
  orgConsole: (params = {}) => httpGet({ url: "/eng/org/orgConsole", params }), // 根据当前登录组织ID和登录人ID获取E签宝企业控制台页面
  closeTheConsole: (data = {}) => httpPut({ url: "/eng/org/frontSynchronizationAuthentication", data }), // 前端调用 实时同步各组织实名信息到数据库
  searchByCustomType: (params = {}) => httpGet({ url: "/eng/customBasics/searchByCustomType", params }), // 根据当前登录组织以及类型查询系统自定义配置表
  addAndUpdate: (data = {}) => httpPost({ url: "/eng/customBasics/addAndUpdate", data }), // 新增或修改系统自定义配置表数据
  byTelephone: (params = {}) => httpGet({ url: "/operation/login/findUserByTelephone", params }), // 根据手机号获取账号列表
  switchLogin: (data = {}) => httpPost({ url: "/auth/switchLogin", data }), // 切换账号
  searchDeptListByOrgId: (params = {}) => httpGet({ url: "/operation/sysDept/searchDeptListByOrgId", params }), // 根据组织id查询该组织下所有部门列表
  searchRoleListByOrgId: (params = {}) => httpGet({ url: "/operation/sysRole/searchRoleListByOrgId", params }),
  // ======================================================== 系统运维开始 ===========================================================
  searchPageByType: (params = {}) => httpGet({ url: "/operation/sysOrg/searchPageByType", params }), // 根据类型查询组织分页列表
  customFeature: (params = {}) => httpGet({ url: "/operation/customBasics/searchByCustomType", params }), // 根据所选组织以及类型查询系统自定义配置表
  customFeatureUpdate: (data = {}) => httpPost({ url: "/operation/customBasics/addAndUpdate", data }), // 批量新增或修改系统自定义配置表数据
  customOrderRuleAdd: (data = {}) => httpPost({ url: "/operation/customOrderRule/add", data }), // 新增自定义订单规则数据
  customOrderRuleDelete: (params = {}) => httpDelete({ url: "/operation/customOrderRule/delete", params }), // 根据ID删除自定义订单规则
  customOrderRuleById: (params = {}) => httpGet({ url: "/operation/customOrderRule/findById", params }), // 根据ID查询自定义订单规则数据
  customOrderRuleList: (params = {}) => httpGet({ url: "/operation/customOrderRule/searchPage", params }), // 根据条件查询自定义订单规则，分页展示
  customOrderRuleUpdate: (data = {}) => httpPut({ url: "/operation/customOrderRule/update", data }), // 根据ID修改自定义订单规则数据
  customOrderRuleDeploy: (data = {}) => httpPut({ url: "/operation/customOrderRule/configureOrder", data }), // 根据单据规则ID配置单据类型
  inChapterOne: (params = {}) => httpGet({ url: "/operation/workflow/getSealPerson", params }), // 查询用章人
  searchOrderTypeByOrgId: (params = {}) => httpGet({ url: "/operation/customOrderRule/searchOrderTypeByOrgId", params }), // 根据ID查询自定义订单规则数据
  findsysUserById: (params = {}) => httpGet({ url: "/operation/sysUser/findById", params }), // 根据用户id查询信息，不带菜单
  withdrawRenewal: (params = {}) => httpGet({ url: "/operation/sysOrg/withdrawRenewal", params }), // 根据续期审批ID撤回续期审批
  // ======================================================== 系统运维结束 ===========================================================
  getAuthStatus: (params = {}) => httpGet({ url: "/auth/getAuthStatus", params }), // 获取实名状态-通用
  noTokenFaceSwiping: (data = {}) => httpPost({ url: "/eng/enterprise/actualAuth", data }), // 未登录实名认证
  testCheckAdd: (data = {}) => httpPost({ url: "/eng/orderInputInventoryDetection/add", data }), // 新增物资入库单检测表数据
  testCheckEdit: (params = {}) => httpGet({ url: "/eng/orderInputInventoryDetection/findByInputId", params }), // 根据入库ID查询物资入库单检测表数据集
  testCheckSearchPage: (params = {}) => httpGet({ url: "/eng/orderInputInventoryDetection/searchPage", params }), // 根据条件查询物资入库单检测表，分页展示
  searchMaterialByInput: (params = {}) => httpGet({ url: "/eng/orderInputInventoryDetection/searchMaterialByInput", params }), // 根据当前项目部ID或项目ID查询来料对象为供应商的入库单关联的物料数据集
  searchMaterialTypes: (params = {}) => httpGet({ url: "/eng/projContract/searchMaterialTypes", params }), // 查询当前登录项目部分项工程关联物料分类数据集
  initiateSealProcessBefore: (params = {}) => httpGet({ url: "/eng/workflowSeal/initiateSealProcessBefore", params }), // 查询签章表格
  getSealScene: (params = {}) => httpGet({ url: "/operation/workflow/getSealScene", params }), // 查询签章表格
  setSealScene: (data = {}) => httpPost({ url: "/operation/workflow/setSealScene", data }), // 配置用章流程场景
  initiateSealProcess: (data = {}) => httpPost({ url: "/eng/workflowSeal/initiateSealProcess", data }), // 发起用章审批
  // ==================== 12-02 20:10 新增分项工程清单表 ==============================================
  getInventory: (params = {}) => httpGet({ url: "/eng/prodItemList/searchItemDetailTable", params }), // 根据组织id获取分项工程配置清单信息记录
  getDetailed: (params = {}) => httpGet({ url: "/eng/prodItemList/searchAvailableDetailClassList", params }), // 根据细目类别获取清单项目
  getDetailTree: (params = {}) => httpGet({ url: "/eng/prodItemList/searchItemDetailTree", params }), // 根据分项工程，获取树形图包含细目分类已保存的细目
  approvalMatterSearchPage: (params = {}) => httpGet({ url: "/operation/sysOrg/approvalMatterSearchPage", params }), // 审批事项分页查询
  findRenewalByPkId: (params = {}) => httpGet({ url: "/operation/sysOrg/findRenewalByPkId", params }), // 审批事项分页查询
  renewalAuth: (data = {}) => httpPut({ url: "/operation/sysOrg/renewal/auth", data }), // 根据单据规则ID配置单据类型
  sysLogSearchPage: (params = {}) => httpGet({ url: "/operation/sysLog/searchPage", params }), // 分页查询日志
  findByIdNoJurisdiction: (params = {}) => httpGet({ url: "/operation/customOrderRule/findByIdNoJurisdiction", params }), // 分页查询日志
  searchCustomMenu: (params = {}) => httpGet({ url: "/operation/sysReOrgMenu/searchCustomMenu", params }), // 查询定制权限菜单
  addOrUpdate: (data = {}) => httpPut({ url: "/operation/sysReOrgMenu/addOrUpdate", data }), // 编辑企业定制权限
  searchRenewalNumber: (params = {}) => httpGet({ url: "/operation/sysOrg/searchRenewalNumber", params }), // 查询定制权限菜单
  // ==================================oa======================================================
  oaMeetingSearchPage: (params = {}) => httpGet({ url: "/eng/oaMeeting/searchPage", params }), // 分页查询会议通知
  oaMeetingAdd: (data = {}) => httpPost({ url: "/eng/oaMeeting/add", data }), // 新增会议通知表数据
  oaMeetingAccept: (data = {}) => httpPut({ url: "/eng/oaMeeting/accept", data }), // 保存新闻通知读取记录数据
  oaMeetingCancel: (params = {}) => httpPut({ url: "/eng/oaMeeting/cancel", params }), // 根据ID取消会议通知表
  oaMeetingDelete: (params = {}) => httpDelete({ url: "/eng/oaMeeting/delete", params }), // 根据ID删除会议通知表
  oaMeetingfindById: (params = {}) => httpGet({ url: "/eng/oaMeeting/findById", params }), // 根据ID查询会议通知表数据
  oaMeetingHomePage: (params = {}) => httpGet({ url: "/eng/oaMeeting/homePage", params }), // 首页的分页查询会议通知
  oaMeetingUpdate: (data = {}) => httpPut({ url: "/eng/oaMeeting/update", data }), // 根据ID修改会议通知表数据
  oaNoticeAdd: (data = {}) => httpPost({ url: "/eng/oaNotice/add", data }), // 新增公告信息表数据
  findNoticeById: (params = {}) => httpGet({ url: "/eng/oaNotice/findById", params }), // 根据ID查询公告信息表数据
  searchNoticPage: (params = {}) => httpGet({ url: "/eng/oaNotice/searchPage", params }), // 根据条件查询公告信息表，分页展示
  searchNoticPage2: (params = {}) => httpGet({ url: "/eng/home/noticePage", params }), // 根据条件查询公告信息表，分页展示
  searchNoticPage3: (params = {}) => httpGet({ url: "/operation/home/noticePage", params }), // 根据条件查询公告信息表，分页展示
  oaNoticeDelete: (params = {}) => httpDelete({ url: "/eng/oaNotice/delete", params }), // 根据ID删除公告信息表
  oaNoticeUpdate: (data = {}) => httpPut({ url: "/eng/oaNotice/update", data }), // 根据ID修改公告信息表数据
  withdrawOaNotice: (params = {}) => httpPut({ url: "/eng/oaNotice/withdrawOaNotice", params }), // 根据ID撤回公告信息
  acceptArticle: (params = {}) => httpPut({ url: "/eng/oaArticle/acceptArticle", params }), // 接收待办
  oaArticleAdd: (data = {}) => httpPost({ url: "/eng/oaArticle/add", data }), // 新增文章表数据
  cooperationCompany: (params = {}) => httpGet({ url: "/eng/oaArticle/cooperationCompany", params }), // 条件查询合作单位
  oaArticleDelete: (params = {}) => httpDelete({ url: "/eng/oaArticle/delete", params }), // 根据ID删除文章表
  oaArticleFindById: (params = {}) => httpGet({ url: "/eng/oaArticle/findById", params }), // 根据ID查询文章表数据
  oaArticleForward: (data = {}) => httpPut({ url: "/eng/oaArticle/forward", data }), // 转发文章
  oaArticleQuoteArticle: (params = {}) => httpGet({ url: "/eng/oaArticle/quoteArticle", params }), // 引用文章
  receiveOaArticle: (params = {}) => httpPut({ url: "/eng/oaArticle/receiveOaArticle", params }), // 根据ID接收收文
  oaArticleSearchPage: (params = {}) => httpGet({ url: "/eng/oaArticle/searchPage", params }), // 根据条件查询文章表，分页展示
  oaArticleUpdate: (data = {}) => httpPut({ url: "/eng/oaArticle/update", data }), // 根据ID修改文章表数据
  withdrawOaArticle: (params = {}) => httpPut({ url: "/eng/oaArticle/withdrawOaArticle", params }), // 根据ID撤回发文
  waitReceived: (params = {}) => httpGet({ url: "/eng/oaArticle/waitReceived", params }), // 根据条件查询文章表，分页展示
  searchLinkOrgId: (params = {}) => httpGet({ url: "/eng/projCustom/searchLinkOrgId", params }), // 根根据当前登录关联项目集查询关联的客户集 关联公司ID非空
  searchByProjectIds: (params = {}) => httpGet({ url: "/eng/projCustom/searchByProjectIds", params }), // 根据项目ID和客户类型查询客户集-只返回有绑定的数据集
  searchCompany: (params = {}) => httpGet({ url: "/eng/oaArticle/searchCompany", params }), // 条件查询合作单位列表
  // ==================================oa======================================================
  // ==================================短信管理======================================================
  sysSmsSearchPage: (params = {}) => httpGet({ url: "/operation/sysSms/searchPage", params }), // 分页查询短信记录
  smsSignAdd: (data = {}) => httpPost({ url: "/operation/smsSign/add", data }), // 新增短信签名数据
  smsSignApprove: (data = {}) => httpPut({ url: "/operation/smsSign/approve", data }), // 审批短信充值
  smsSignDelete: (params = {}) => httpDelete({ url: "/operation/smsSign/delete", params }), // 根据ID删除短信签名
  smsSignFindById: (params = {}) => httpGet({ url: "/operation/smsSign/findById", params }), // 根据ID查询短信签名数据
  smsSignRecallSign: (params = {}) => httpPut({ url: "/operation/smsSign/recallSign", params }), // 根据ID撤回短信签名
  searchApproveSignPage: (params = {}) => httpGet({ url: "/operation/smsSign/searchApproveSignPage", params }), // 根据条件查询短信签名申请，分页展示
  smsSignSearchByOrgId: (params = {}) => httpGet({ url: "/operation/smsSign/searchByOrgId", params }), // 查询当前登录组织的短信签名
  smsSignSearchPage: (params = {}) => httpGet({ url: "/operation/smsSign/searchPage", params }), // 根据条件查询短信签名，分页展示
  smsSignSetConsent: (params = {}) => httpPut({ url: "/operation/smsSign/setConsent", params }), // 根据ID把短信签名设为默认
  smsSignUpdate: (data = {}) => httpPut({ url: "/operation/smsSign/update", data }), // 根据ID修改短信签名数据
  smsTemplateAdd: (data = {}) => httpPost({ url: "/operation/smsTemplate/add", data }), // 新增短信模板表数据
  smsTemplateDelete: (params = {}) => httpDelete({ url: "/operation/smsTemplate/delete", params }), // 根据ID删除短信模板表
  smsTemplateFindById: (params = {}) => httpGet({ url: "/operation/smsTemplate/findById", params }), // 根据ID查询短信模板表数据-前端调用
  smsTemplateSearchPage: (params = {}) => httpGet({ url: "/operation/smsTemplate/searchPage", params }), // 根据条件查询短信模板表，分页展示
  smsTemplateUpdate: (data = {}) => httpPut({ url: "/operation/smsTemplate/update", data }), // 根据ID修改短信模板表数据
  smsTemplateSearchByOrgId: (params = {}) => httpGet({ url: "/operation/smsTemplate/searchByOrgId", params }), // 获取当前登录组织的短信模板信息
  sysSmsAddBatch: (data = {}) => httpPost({ url: "/operation/sysSms/addBatch", data }), // 保存短信发送记录
  searchDeptByOrgId: (params = {}) => httpGet({ url: "/operation/sysDept/searchDeptByOrgId", params }), // 查询当前登录组织下所有的部门列表，带下属员工数据集
  orgTemplate: (params = {}) => httpGet({ url: "/operation/orgTemplate/searchPage", params }), // 根据条件查询短信模板表，分页展示
  triggerStatus: (params = {}) => httpPut({ url: "/operation/orgTemplate/triggerStatus", params }), // 启用/禁用组织短信配置
  getSMSDetailByOrgId: (params = {}) => httpGet({ url: "/operation/sysSms/getSMSDetailByOrgId", params }), // 查询短信使用各项详情
  sysSmsRecharge: (params = {}) => httpGet({ url: "/operation/sysSmsRecharge/searchPage", params }), // 根据条件查询短信充值记录，分页展示
  sysSmsRechargeDelete: (params = {}) => httpDelete({ url: "/operation/sysSmsRecharge/delete", params }), // 根据ID删除短信模板表
  sysSmsRechargeFindById: (params = {}) => httpGet({ url: "/operation/sysSmsRecharge/findById", params }), // 根据条件查询短信充值记录，分页展示
  sysSmsRechargeApprove: (data = {}) => httpPut({ url: "/operation/sysSmsRecharge/approve", data }), // 审批短信充值
  getSMSDetail: (params = {}) => httpGet({ url: "/operation/sysSms/getSMSDetail", params }), // 根据条件查询短信充值记录，分页展示
  findByOrgId: (params = {}) => httpGet({ url: "/operation/sysSmsAlarmSet/findByOrgId", params }), // 查询当前组织短信预警设置数据
  sysSmsAlarmSetUpdate: (data = {}) => httpPut({ url: "/operation/sysSmsAlarmSet/update", data }), // 根据ID修改短信预警设置数据
  sysSmsAlarmSetAdd: (data = {}) => httpPost({ url: "/operation/sysSmsAlarmSet/add", data }), // /operation/sysSmsAlarmSet/update
  searchSMSGroupByOrg: (params = {}) => httpGet({ url: "/operation/sysSms/searchSMSGroupByOrg", params }), // 企业短信管理
  searchSMSRecord: (params = {}) => httpGet({ url: "/operation/sysSms/searchSMSRecord", params }), // 企业短信记录
  sysSmsRechargeAdd: (data = {}) => httpPost({ url: "/operation/sysSmsRecharge/add", data }), // 新增短信充值记录数据
  // ==================================短信管理======================================================
  prodProcessApproveExport: (data = {}) => httpPost({ url: "/eng/prodProcessApprove/export", data }), // 施工验收导出
  prodProcessPrintPDF: (data = {}) => httpPost({ url: "/eng/prodProcessApprove/printPDF", data }), // 施工验收打印PDF
  prodChangesDesignExport: (data = {}) => httpPost({ url: "/eng/prodChangesDesign/export", data }), // 变更设计导出
  prodChangesDesignPrintPDF: (data = {}) => httpPost({ url: "/eng/prodChangesDesign/printPDF", data }), // 变更设计打印PDF
  getBatchExportFile: (data = {}) => httpPost({ url: "/eng/statsProjectSettle/batchExportFile", data }), // 企业短信记录
  putExportFile: (data = {}) => httpPost({ url: "/eng/statsProjectSettle/putExportFile", data }), // 变更设计打印PDF
  // 档案库
  searchStatsItemFinishFile: (params = {}) => httpGet({ url: "/eng/statsItemFinishRecordTable/searchStatsItemFinishFile", params }), // 根据项目ID(非项目部身份登录需要传)查询档案库数据集
  searchCompleted: (params = {}) => httpGet({ url: "/eng/prodItemList/searchCompleted", params }), // 根据当前登录项目部ID查询已完成分项工程数据集
  addStatsItemFinishFile: (data = {}) => httpPost({ url: "/eng/statsItemFinishRecordTable/add", data }), // 新增分项工程完成记录动态表数据
  delStatsItemFinishFile: (params = {}) => httpDelete({ url: "/eng/statsItemFinishRecordTable/deleteBatch", params }), // 根据主键ID集批量删除分项工程完成记录动态表数据
  batchDownloadItemFinishRecordTable: (data = {}) => httpPost({ url: "/eng/statsItemFinishRecordTable/batchDownloadItemFinishRecordTable", data }), // 批量下载(导出)档案文件
  batchPutItemFinishRecordTable: (data = {}) => httpPost({ url: "/eng/statsItemFinishRecordTable/batchPutItemFinishRecordTable", data }), // 批量打印档案文件
  searchCustomDetail: (params = {}) => httpGet({ url: "/eng/prodItemList/searchCustomDetail", params }), // 获取自定义的清单
  searchCustomMaterial: (params = {}) => httpGet({ url: "/eng/prodItemList/searchCustomMaterial", params }), // 获取自定义的材料
  orderInventoryExport: (data = {}) => httpPost({ url: "/eng/orderInventory/export", data }), // 盘点单导出
  orderInventoryPrintPDF: (data = {}) => httpPost({ url: "/eng/orderInventory/printPDF", data }), // 盘点单打印
  configurationSet: (params = {}) => httpGet({ url: "/operation/configurationSet/searchByOrgId", params }), // 根据条件查询当前登录组织的系统配置数据
  findSysUserListByOrgId: (params = {}) => httpGet({ url: "/eng/public/findSysUserListByOrgId", params }), // 根据组织主键ID查询员工列表
  configurationSetPost: (data = {}) => httpPost({ url: "/operation/configurationSet/addOrUpdate", data }), // 新增或修改系统配置表数据
  searchMatterByUserId: (params = {}) => httpGet({ url: "/eng/public/searchMatterByUserId", params }), // 根据组织主键ID查询员工列表
  preconditions: (params = {}) => httpGet({ url: "/auth/scanCode/preconditions", params }), // 获取扫码登陆前置条件
  scanCodeLogin: (data = {}) => httpPost({ url: "/auth/scanCode/login?scanCode=" + data.scanCode }), // 扫码登陆
  searchUsingScene: (params = {}) => httpGet({ url: "/operation/workflow/searchUsingScene", params }),
  menuIconSearch: (params = {}) => httpGet({ url: "/operation/menuIcon/search", params }), // 根据条件查询菜单图标表
  menuIconAdd: (data = {}) => httpPost({ url: "/operation/menuIcon/add", data }), // 新增菜单图标表数据
  menuIconDelete: (params = {}) => httpDelete({ url: "/operation/menuIcon/delete", params }), // 根据ID删除菜单图标表
  menuIconSearchByTree: (params = {}) => httpGet({ url: "/operation/sysMenu/searchByTree", params }), // 条件查询菜单数据集 树形
  getWorkflowDetail: (params = {}) => httpGet({ url: "/eng/prodProcessApprove/getWorkflowDetail", params }), // 查询流程详情
  getApprover: (params = {}) => httpGet({ url: "/eng/prodChangesDesign/getWorkflowDetail", params }), // 查询流程详情所有审批人
  getApproverSettle: (params = {}) => httpGet({ url: "/eng/statsProjectSettle/getWorkflowDetail", params }), // 查询流程详情所有审批人
  getOrderInventoryApprover: (params = {}) => httpGet({ url: "/eng/orderInventory/getWorkflowDetail", params }), // 查询流程详情所有审批人
  getWorkflowSealApprover: (params = {}) => httpGet({ url: "/eng/workflowSeal/getWorkflowDetail", params }), // 查询流程详情所有审批
  approvalSealProcess: (data = {}) => httpPost({ url: "/eng/workflowSeal/approvalSealProcess", data }), // 审批签章流程
  revocationWithdrawSeal: (data = {}) => httpPost({ url: "/eng/workflowSeal/withdrawSeal?" + "pkId=" + data.pkId, data }), // 撤回签章
  // ==============================================扫码===================================================================================
  addQRCode: (params = {}) => httpGet({ url: "/eng/public/addQRCode", params }), // 把二维码有效时间存入缓存
  addQRCode2: (data = {}) => httpPost({ url: "/eng/public/addUniqueQRCode", data }), // 把二维码有效时间存入缓存
  queryQRCode: (params = {}) => httpGet({ url: "/eng/public/queryQRCode", params }), // 根据唯一标识查询二维码的扫码状态 返回的类型：待扫码：0，已扫码：1
  updateQRCode: (params = {}) => httpGet({ url: "/eng/public/updateQRCode", params }), // 根据唯一标识修改二维码的扫码状态为已扫码
  addQRCodeLabourTeam: (params = {}) => httpGet({ url: "/eng/labourTeam/addQRCode", params }), // 加入班组二维码时间
  withdrawRecharge: (params = {}) => httpGet({ url: "/operation/sysSmsRecharge/withdrawRecharge", params }), // 根据短信充值记录ID撤回短信充值赠送审批
  // ==============================================状态码===================================================================================
  searchProcessApproveStates: (params = {}) => httpGet({ url: "/eng/prodProcessApprove/searchProcessApproveStates", params }), // 查询施工验收状态数据集
  searchOrderInventoryStates: (params = {}) => httpGet({ url: "/eng/orderInventory/searchOrderInventoryStates", params }), // 查询盘点单状态数据集
  searchSettleStates: (params = {}) => httpGet({ url: "/eng/statsProjectSettle/searchSettleStates", params }), // 查询计量管理状态数据集
  getWorkflowType: (params = {}) => httpGet({ url: "/operation/workflow/getWorkflowType", params }), // 根据查询类型获取流程类型
  getCustomizedWorkflowType: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/getWorkflowType", params }), // 获取项目部盘点流程类型
  // 定制流程接口============================================================================
  customizedWorkflowSearch: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/searchPageByOrgId", params }), // 获取项目部盘点流程类型
  customizedSearchUsingScene: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/searchUsingScene", params }), // 根据组织ID查询所属用章流程场景数据集
  customizedWorkTypeQuery: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/workTypeQuery", params }), // 查询流程类型
  customizedSetSealScene: (data = {}) => httpPost({ url: "/operation/customizedWorkflow/setSealScene", data }), // 配置用章流程场景
  getCustomizedSealScene: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/getSealScene", params }), // 查询已配置的用章流程场景
  customizedFindWorkflowTemplateById: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/findWorkflowTemplateById", params }), // 根据ID查询系统流程模板
  customizedSearchListByOrgId: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/searchListByOrgId", params }), // 查询系统或项目审批流程
  customizedSearchWorkflowTemplateList: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/searchWorkflowTemplateList", params }), // 根据ID删除系统流程模板
  customizedDeleteFlow: (params = {}) => httpDelete({ url: "/operation/customizedWorkflow/delete", params }), // 根据ID删除系统流程模板
  customizedPublishStatus: (params = {}) => httpPut({ url: "/operation/customizedWorkflow/updateStatusById", params }), // 根据ID修改系统流程模板流程的发布状态
  customizedConfigurationItem: (params = {}) => httpPut({ url: "/operation/customizedWorkflow/updateItemsById", params }), // 根据ID修改系统流程模板流程的配置分项工程
  customizedAddFlow: (data = {}) => httpPost({ url: "/operation/customizedWorkflow/add", data }), // 新增定制流程模板
  customizedBaseWorkflowUpdate: (data = {}) => httpPut({ url: "/operation/customizedWorkflow/update", data }), // 编辑流程
  customizedInChapterOne: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/getSealPerson", params }), // 查询用章人
  customizedAuditRole: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/searchSysAuditRole", params }), // 获取新增流程审批角色
  customizedSearchItems: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/searchItems", params }), // 根据项目ID查询分项工程的工程细目 带单价
  // 定制流程接口============================================================================
  // 自定义流程和自定义验收流程============================================================================
  customAddFlow: (data = {}) => httpPost({ url: "/eng/customWorkflow/add", data }), // 新增系统流程模板
  customUpdate: (data = {}) => httpPut({ url: "/eng/customWorkflow/update", data }), // 编辑流程
  customUsingScene: (params = {}) => httpGet({ url: "/eng/customWorkflow/searchUsingScene", params }),
  searchPageCustomU: (params = {}) => httpGet({ url: "/eng/customWorkflow/searchPageByOrgId", params }), // 根据条件查询系统流程模板，分页展示
  customWorkQuery: (params = {}) => httpGet({ url: "/eng/customWorkflow/workTypeQuery", params }),
  customWorkSealScene: (data = {}) => httpPost({ url: "/eng/customWorkflow/setSealScene", data }), // 配置用章流程场景
  customWorkScene: (params = {}) => httpGet({ url: "/eng/customWorkflow/getSealScene", params }), // 查询签章表格
  customById: (params = {}) => httpGet({ url: "/eng/customWorkflow/findWorkflowTemplateById", params }), // 根据ID查询系统流程模板
  customChapterOne: (params = {}) => httpGet({ url: "/eng/customWorkflow/getSealPerson", params }), // 查询用章人
  customDeleteFlow: (params = {}) => httpDelete({ url: "/eng/customWorkflow/delete", params }), // 根据ID删除系统流程模板
  customStatus: (params = {}) => httpPut({ url: "/eng/customWorkflow/updateStatusById", params }), // 根据ID修改系统流程模板流程的发布状态
  customItem: (params = {}) => httpPut({ url: "/eng/customWorkflow/updateItemsById", params }), // 根据ID修改系统流程模板流程的配置分项工程
  customSysAuditRole: (params = {}) => httpGet({ url: "/eng/customWorkflow/searchSysAuditRole", params }), // 获取新增流程审批角色
  customListByOrgId: (params = {}) => httpGet({ url: "/eng/customWorkflow/searchListByOrgId", params }),
  customGetWorkflowType: (params = {}) => httpGet({ url: "/eng/customWorkflow/getWorkflowType", params }),
  customSearchWorkflowTemplateList: (params = {}) => httpGet({ url: "/eng/customWorkflow/searchWorkflowTemplateList", params }), // 获取子程序列表
  // 自定义流程和自定义验收流程============================================================================
  // 0531需求新增api
  getWorkflowTables: (params = {}) => httpGet({ url: "/eng/prodProcessApprove/getWorkflowTable", params }), // 查询流程类型
  searchByBusinessNode: (params = {}) => httpGet({ url: "/eng/workflowData/searchByBusinessNode", params }), // 查询节点详情页面
  homeFaceSwiping: (data = {}) => httpPost({ url: "/eng/enterprise/faceSwiping", data }), // 企业或个人获取认证链接
  customizedWorkflowPdf: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/quotePdfListByType", params }), // 定制流程施工验收流程引用编辑时获取pdf下拉列表
  customWorkflowPdf: (params = {}) => httpGet({ url: "/eng/customWorkflow/quotePdfListByType", params }), // 自定义流程施工验收流程引用编辑时获取pdf下拉列表
  quoteTableByType: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/quoteTableByType", params }), // 定制流程施工验收流程引用编辑时获取表格下拉列表
  engQuoteTableByType: (params = {}) => httpGet({ url: "/eng/customWorkflow/quoteTableByType", params }), // 自定义施工验收流程引用编辑时获取表格下拉列表
  workflowById: (params = {}) => httpGet({ url: "/operation/workflow/searchWorkflowTemplateByIds", params }), // 系统设置流程根据ID查询系统流程模板(无权限控制)
  customWorkflowById: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/searchWorkflowTemplateByIds", params }), // 定制系统设置流程根据ID查询系统流程模板(无权限控制)
  engWorkflowById: (params = {}) => httpGet({ url: "/eng/customWorkflow/searchWorkflowTemplateByIds", params }), // 自定义流程根据ID查询系统流程模板(无权限控制)
  // 0702新增接口
  searchMenuDataAuthorize: (params = {}) => httpGet({ url: "/eng/public/searchMenuDataAuthorize", params }), // 获取当前登录用户角色关联菜单权限数据集
  getUserAuthorizeByRoleId: (params = {}) => httpGet({ url: "/operation/sysUser/getUserAuthorizeByRoleId", params }), // 通过roleId查詢用戶数据权限
  searchOrderOutApplyPage: (params = {}) => httpGet({ url: "/eng/orderOutApply/searchPage", params }), // 根据条件查询物资出库申请单，分页展示
  findApplyPurchaseOrderByProjectId: (params = {}) => httpGet({ url: "/eng/orderOutApply/findApplyPurchaseOrderByProjectId", params }), // 根据标段项目ID查询采购计划单列表-供应商出库申请专用
  findOrderOutApplyBySource: (params = {}) => httpGet({ url: "/eng/inventory/out/findOrderOutApplyBySource", params }), // 根据出库对象获取物资出库申请单下拉列表
  searchOrderOutApply: (params = {}) => httpGet({ url: "/eng/inventory/out/searchOrderOutApply", params }), // 条件查询供货申请单出库物料数据集
  findOrderOutApplyById: (params = {}) => httpGet({ url: "/eng/orderOutApply/findById", params }), // 根据ID查询物资出库申请单数据
  findDictBySupplyType: (params = {}) => httpGet({ url: "/eng/orderOutApply/findDictBySupplyType", params }), // 物资出库申请单获取出库对象
  delOrderOutApply: (params = {}) => httpDelete({ url: "/eng/orderOutApply/delete", params }), // 根据ID删除物资出库申请单
  updateOrderOutApply: (data = {}) => httpPut({ url: "/eng/orderOutApply/update", data }), // 根据ID修改物资出库申请单数据
  updateApplyCodeByBusinessType: (data = {}) => httpPut({ url: "/eng/orderOutApply/updateApplyCodeByBusinessType", data }), // 根据主键ID和业务类型修改物资申请单状态
  addOrderOutApply: (data = {}) => httpPost({ url: "/eng/orderOutApply/add", data }), // 新增物资出库申请单数据
  searchProdItemApprovalPage: (params = {}) => httpGet({ url: "/eng/prodItemApprovalRecord/searchPage", params }), // 根据条件查询分项工程审批记录表，分页展示
  //  后端删除了 /eng/prodItemApprovalRecord/findById 改成 /eng/customWorkflow/findApprovalById
  // findProdItemApprovalById: (params = {}) => httpGet({ url: "/eng/prodItemApprovalRecord/findById", params }), // 根据ID查询分项工程审批记录表数据
  findProdItemApprovalById: (params = {}) => httpGet({ url: "/eng/customWorkflow/findApprovalById", params }), // 根据ID查询分项工程审批记录表数据
  approveExamineStatsQuery: (params = {}) => httpGet({ url: "/eng/prodItemApprovalRecord/approveExamineStatsQuery", params }), // 查询分项工程流程审批状态
  approveProdItemApprovalExamine: (data = {}) => httpPut({ url: "/eng/prodItemApprovalRecord/approveExamine", data }), // 根据ID审批分项工程审批记录
  // 定制流程验收流程新需求
  submitApprove: (data = {}) => httpPost({ url: "/operation/customizedWorkflow/submitApprove?" + "itemId=" + data.itemId }), // 提交分项工程流程审批
  applyWithdraw: (data = {}) => httpPost({ url: "/operation/customizedWorkflow/applyWithdraw?" + "fkItemId=" + data.fkItemId + "&remark=" + data.remark }), // 申请撤回分项工程流程审批
  withdraw: (data = {}) => httpPut({ url: "/operation/customizedWorkflow/withdraw?pkId=" + data.pkId }), // 根据ID撤回分项工程审批记录
  findByItemId: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/findByItemId", params }), // 根据分项工程ID查询分项工程审批记录数据
  customizedSearchTableVos: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/searchTableVos", params }), // 根据条件查询表格数据集
  // 自定义流程验收流程新需求
  engSubmitApprove: (data = {}) => httpPost({ url: "/eng/customWorkflow/submitApprove", data }), // 提交分项工程流程审批
  engApplyWithdraw: (data = {}) => httpPost({ url: "/eng/customWorkflow/applyWithdraw", data }), // 申请撤回分项工程流程审批
  engWithdraw: (data = {}) => httpPut({ url: "/eng/customWorkflow/withdraw", data }), // 根据ID撤回分项工程审批记录
  engFindByItemId: (params = {}) => httpGet({ url: "/eng/customWorkflow/findByItemId", params }), // 根据分项工程ID查询分项工程审批记录数据
  searchTableVos: (params = {}) => httpGet({ url: "/eng/customWorkflow/searchTableVos", params }), // 根据条件查询表格数据集
  acceptanceProcessList: (params = {}) => httpGet({ url: "/eng/customWorkflow/searchItems", params }), // 查询分项工程流程数据集(树形)
  searchTableVosList: (params = {}) => httpGet({ url: "/operation/workflow/searchTableVos", params }), // 根据条件查询表格数据集
  quotePdfListByType: (params = {}) => httpGet({ url: "/operation/workflow/quotePdfListByType", params }), // 获取pdf下拉列表
  customizedSearchItemsByOrgId: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/searchItemsByOrgId", params }), // 获取pdf下拉列表
  quoteUpdate: (data = {}) => httpPut({ url: "/eng/customWorkflow/quoteUpdate", data }), // 自定义引用编辑系统流程
  customizedQuoteUpdate: (data = {}) => httpPut({ url: "/operation/customizedWorkflow/quoteUpdate", data }), // 定制引用编辑系统流程
  quotePdfsByType: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/quotePdfsByType", params }), //  定制引用编辑获取pdf下拉列表
  customQuotePdfsByType: (params = {}) => httpGet({ url: "/eng/customWorkflow/quotePdfsByType", params }), // 自定义引用编辑获取pdf下拉列表
  quoteSearchTableVos: (params = {}) => httpGet({ url: "/eng/customWorkflow/quoteSearchTableVos", params }), // 引用编辑查询表格数据集
  updateSearchTableVos: (params = {}) => httpGet({ url: "/eng/customWorkflow/updateSearchTableVos", params }), // 编辑时查询表格数据集
  searchNoLink: (params = {}) => httpGet({ url: "/eng/orderPurchase/searchNoLink", params }), // 编辑时查询表格数据集
  noTokenFaceSwipingNoParam: (data = {}) => httpPost({ url: "/eng/enterprise/personAuthorization", data }), // 重新授权
  authorization: (data = {}) => httpPost({ url: "/eng/enterprise/authorization", data }), // 企业授权认证
  // 9/14新增接口
  searchMaterialSummary: (params = {}) => httpGet({ url: "/eng/prodItemList/searchMaterialSummary", params }), // 查询物资
  // 1007新接口
  holdSealUpdate: (data = {}) => httpPost({ url: "/eng/holdSeal/update", data }), // 客户端编辑持章授权
  operationHoldSealUpdate: (data = {}) => httpPost({ url: "/operation/holdSeal/update", data }), // 运营商编辑持章授权
  holdSealFindById: (params = {}) => httpGet({ url: "/eng/holdSeal/findById", params }), // 客户端根据ID查询持章授权
  operationHoldSealFindById: (params = {}) => httpGet({ url: "/operation/holdSeal/findById", params }), // 运营商根据ID查询持章授权
  holdSealDelete: (params = {}) => httpDelete({ url: "/eng/holdSeal/delete", params }), // 客户端根据ID删除持章授权
  operationHoldSealDelete: (params = {}) => httpDelete({ url: "/operation/holdSeal/delete", params }), // 运营商根据ID删除持章授权
  searchSealType: (params = {}) => httpGet({ url: "/eng/holdSeal/searchSealType", params }), // 客户端查询印章类型列表
  operationSearchSealType: (params = {}) => httpGet({ url: "/operation/holdSeal/searchSealType", params }), // 运营商查询印章类型列表
  orgSealSearchPage: (params = {}) => httpGet({ url: "/eng/holdSeal/orgSealSearchPage", params }), // 客户端分页查询当前登录组织的印章列表
  operationOrgSealSearchPage: (params = {}) => httpGet({ url: "/operation/holdSeal/orgSealSearchPage", params }), // 运营商分页查询当前登录组织的印章列表
  getOrgSealState: (params = {}) => httpGet({ url: "/operation/public/getOrgSealState", params }), // 检查运营商企业实名或者授权状态
  getEOrgSealState: (params = {}) => httpGet({ url: "/eng/public/getOrgSealState", params }), // 检查客户端企业实名或者授权状态
  getSealNameByType: (params = {}) => httpGet({ url: "/eng/holdSeal/getSealNameByType", params }), // 客户端根据当前组织印章类型查询印章名称和编号
  getOperationSealNameByType: (params = {}) => httpGet({ url: "/operation/holdSeal/getSealNameByType", params }), // 运营商根据当前组织印章类型查询印章名称和编号
  userSealSearchPage: (params = {}) => httpGet({ url: "/eng/holdSeal/userSealSearchPage", params }), // 客户端根据组织印章分页查询员工印章列表
  operationUserSealSearchPage: (params = {}) => httpGet({ url: "/operation/holdSeal/userSealSearchPage", params }), // 运营商根据组织印章分页查询员工印章列表
  allDeptAndUser: (params = {}) => httpGet({ url: "/eng/holdSeal/allDeptAndUser", params }), // 客户端查询当前登录组织的部门列表带上部门所属员工列表
  operationAllDeptAndUser: (params = {}) => httpGet({ url: "/operation/holdSeal/allDeptAndUser", params }), // 运营商查询当前登录组织的部门列表带上部门所属员工列表
  searchDept: (params = {}) => httpGet({ url: "/eng/holdSeal/searchDept", params }), // 客户端查询当前登录组织的部门列表(有员工的)
  operationSearchDept: (params = {}) => httpGet({ url: "/operation/holdSeal/searchDept", params }), // YYS询当前登录组织的部门列表(有员工的)
  searchRole: (params = {}) => httpGet({ url: "/eng/holdSeal/searchRole", params }), // 查询当前登录组织的角色列表(有员工的)
  operationSearchRole: (params = {}) => httpGet({ url: "/operation/holdSeal/searchRole", params }), // YYS查询当前登录组织的角色列表(有员工的)
  searchPageByUser: (params = {}) => httpGet({ url: "/eng/holdSeal/searchPageByUser", params }), // 分页查询当前登录组织的员工列表
  operationSearchPageByUser: (params = {}) => httpGet({ url: "/operation/holdSeal/searchPageByUser", params }), // YYS分页查询当前登录组织的员工列表
  getOrgSealState2: (params = {}) => httpGet({ url: "/eng/public/getOrgSealState", params }), // 检查企业实名或者授权状态
  getTwoCode: (params = {}) => httpGet({ url: "/eng/holdSeal/getTwoCode", params }), // 检查企业实名或者授权状态
  getOperationTwoCode: (params = {}) => httpGet({ url: "/operation/holdSeal/getTwoCode", params }), // 检查企业实名或者授权状态
  holdSealAdd: (data = {}) => httpPost({ url: "/eng/holdSeal/add", data }), // 客户端新增持章授权
  operationHoldSealAdd: (data = {}) => httpPost({ url: "/operation/holdSeal/add", data }), // 运营商新增持章授权
  operationCustomizedWorkflow: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/getOrgSealState", params }), // 检查企业实名或者授权状态 企业状态 未实名：0， 已实名授权未过期：1，已实名授权已过期：2
  effective: (params = {}) => httpGet({ url: "/auth/account/effective", params }), // 检查企业实名或者授权状态 企业状态 未实名：0， 已实名授权未过期：1，已实名授权已过期：2
  switchAnewLogin: (data = {}) => httpPost({ url: "/auth/switchAnewLogin", data }), // 重新登录
  operationAuthorization: (params = {}) => httpGet({ url: "/operation/enterprise/authorization", params }), // 企业授权认证
  quoteSearchSubTableVos: (params = {}) => httpGet({ url: "/eng/customWorkflow/quoteSearchSubTableVos", params }), // 引用编辑查询表格数据集(模板和节点)
  updateSearchPdfListByType: (params = {}) => httpGet({ url: "/eng/customWorkflow/updateSearchPdfListByType", params }), // 编辑时获取pdf下拉列表

  // 1016版本新接口
  getUrlByNewTelephone: (params = {}) => httpGet({ url: "/eng/user/getUrlByNewTelephone", params }), // 修改手机号码时 调用所属接口 0:直接修改 1:调用核身 2:调用实名
  modifyTelephoneBefore: (params = {}) => httpGet({ url: "/eng/user/modifyTelephoneBefore", params }), // 修改手机号码之前获取链接
  modifyTelephone: (data = {}) => httpPut({ url: "/eng/user/modifyTelephone", data }), // 修改手机号码
  unitUpdateEnableStatus: (data = {}) => httpPut({ url: "/operation/unit/updateEnableStatus", data }), // 修改单位启用状态
  unitSearchPage: (params = {}) => httpGet({ url: "/operation/unit/searchPage", params }), // 根据条件分页查询单位)
  getChangePhoneUserList: (params = {}) => httpGet({ url: "/eng/user/getUserList", params }), // 修改手机号码时获取账号列表
  validateTelephoneIsAccess: (params = {}) => httpGet({ url: "/eng/user/validateTelephoneIsAccess", params }), // 校验手机号是否本人
  validateModifyTelephone: (params = {}) => httpGet({ url: "/eng/user/validateModifyTelephone", params }), // 修改手机号码时校验账号是否符合规范
  windGradeAllList: (params = {}) => httpGet({ url: "/eng/prodConstructionJournal/windGradeAllList", params }), // 查询所有风力等级列表
  findCheckByInputId: (params = {}) => httpGet({ url: "/eng/inventory/findByInputId", params }), // 入库查询检测信息
  retractCopy: (data = {}) => httpPost({ url: "/eng/prodTechnicalDisclosure/retractCopy", data }), // 撤回抄送
  searchAppointRole: (params = {}) => httpGet({ url: "/operation/workflow/searchAppointRole", params }), // 流程发起设置-指定岗位列表

  // 1030新增接口
  searchAppointRoleEng: (params = {}) => httpGet({ url: "/eng/customWorkflow/searchAppointRole", params }), // 流程发起设置-指定岗位列表
  searchAppointRoleOperation: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/searchAppointRole", params }), // 流程发起设置-指定岗位列表
  searchItemByTemplate: (params = {}) => httpGet({ url: "/eng/prodItemApprovalRecord/searchItemByTemplate", params }), // 根据流程模板ID集查询关联的审批分项工程树形
  submitApproveWorkflowTemplate: (data = {}) => httpPost({ url: "/eng/customWorkflow/submitApproveWorkflowTemplate", data }), // 批量提交流程审批
  applyWithdrawWorkflowTemplate: (data = {}) => httpPost({ url: "/eng/customWorkflow/applyWithdrawWorkflowTemplate", data }), // 批量申请撤回流程审批
  withdrawWorkflowTemplate: (data = {}) => httpPut({ url: "/eng/customWorkflow/withdrawWorkflowTemplate", data }), // 批量撤回流程审批记录
  findByPkId: (params = {}) => httpGet({ url: "/eng/customWorkflow/findByPkId", params }), // 根据流程模板ID集查询关联的审批分项工程树形
  searchProjectByOrgId: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/searchProjectByOrgId", params }), // 获取组织的所有项目集信息
  searchByProjectIdOperation: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/searchByProjectId", params }), // 根据项目ID查询标段项目数据集
  findByPkIdOperation: (params = {}) => httpGet({ url: "/operation/customizedWorkflow/findByPkId", params }), // 根据流程模板ID查询流程审批记录数据
  searchSummaryDates: (params = {}) => httpGet({ url: "/eng/statsItemFinishRecord/searchSummaryDates", params }), // 获取时间列表(进度汇总和结算汇总的图表)
  materialTypemateriAlType: (params = {}) => httpGet({ url: "/operation/materialType/allTypes", params }), // 查询物料分类全部数据
  // 1108接口
  searchItemsWorkArea: (params = {}) => httpGet({ url: "/eng/prodWorkArea/searchItems", params }), // 根据当前登录项目部ID查询分项工程
  // 1117接口
  contentExport: (params = {}) => httpGet({ url: "/eng/projContract/batchExportFile", params }), // 导出合同清单
  contentPrint: (params = {}) => httpGet({ url: "/eng/projContract/printExportFile", params }), // 打印合同清单
  getSettleInfo: (data = {}) => httpPost({ url: "/eng/statsProjectSettle/getSettleInfo", data }), // 获取结算详情
  searchContracts: (params = {}) => httpGet({ url: "/eng/projContract/searchContracts", params }), // 根据条件查询合同
  updateStates: (data = {}) => httpPut({ url: "/operation/material/updateStates", data }), // 根据ID修改物料状态
  projectSummaryPie: (params = {}) => httpGet({ url: "/eng/projSummaryReality/projectSummaryPie", params }), // 项目部查询进度汇总(饼图)
  projectDetailPie: (params = {}) => httpGet({ url: "/eng/projSummaryReality/projectDetailPie", params }), // 项目部查询工区或分包单位各清单占比(饼图)
  superiorSummaryPie: (params = {}) => httpGet({ url: "/eng/projSummaryReality/superiorSummaryPie", params }), // 上级单位(建设单位、监理公司、设计院和施工单位)查询进度汇总(所有标段项目的汇总饼图)
  superiorSummaryListPie: (params = {}) => httpGet({ url: "/eng/projSummaryReality/superiorSummaryListPie", params }), // 项目部查询工区或分包单位各清单占比(饼图)
  superiorDetailPie: (params = {}) => httpGet({ url: "/eng/projSummaryReality/superiorDetailPie", params }), // 上级单位(建设单位、监理公司、设计院和施工单位)查询清单占比(饼图)
  projectSummary: (params = {}) => httpGet({ url: "/eng/projSummaryReality/projectSummary", params }), // 项目部查询进度汇总(柱状图和折线图)
  superiorSummary: (params = {}) => httpGet({ url: "/eng/projSummaryReality/superiorSummary", params }), // 上级单位(建设单位、监理公司、设计院和施工单位)查询进度汇总(柱状图和折线图)
  settleSummary: (params = {}) => httpGet({ url: "/eng/projSummaryReality/settleSummary", params }), // 计量汇总
  getWorkflowTemplateByItemId: (params = {}) => httpGet({ url: "/eng/prodItemList/getWorkflowTemplateByItemId", params }), // 根据分项id获取模板
  // v2.0.20231219分支
  sysMenuGroupSearchPage: (params = {}) => httpGet({ url: "/operation/sysMenuGroup/searchPage", params }), // 根据条件查询菜单分组表，分页展示
  sysMenuGroupSearch: (params = {}) => httpGet({ url: "/operation/sysMenuGroup/search", params }), // 查询所有PC端菜单分组名称列表
  sysMenuGroupAdd: (data = {}) => httpPost({ url: "/operation/sysMenuGroup/add", data }), // 新增菜单分组
  sysMenuGroupFindById: (params = {}) => httpGet({ url: "/operation/sysMenuGroup/findById", params }), // 根据ID查询菜单分组
  sysMenuGroupUpdate: (data = {}) => httpPut({ url: "/operation/sysMenuGroup/update", data }), // 根据ID修改菜单分组
  sysMenuGroupDelete: (params = {}) => httpDelete({ url: "/operation/sysMenuGroup/delete", params }), // 根据ID删除菜单分组表
  secureBinding: (data = {}) => httpPut({ url: "/eng/superiorOrg/secureBinding?" + "customId=" + data.customId }), // 解除绑定上级单位客户数据
  searchSuperiorOrgByLinkPhone: (params = {}) => httpGet({ url: "/eng/superiorOrg/searchSuperiorOrgByLinkPhone", params }), // 根据电话号码准确查询上级单位
  searchSuperiorOrg: (params = {}) => httpGet({ url: "/eng/superiorOrg/searchSuperiorOrg", params }), // 查询上级单位
  binding: (data = {}) => httpPost({ url: "/eng/superiorOrg/binding", data }), // 绑定上级单位客户数据
  oaSealSearchPage: (params = {}) => httpGet({ url: "/eng/oaSeal/searchPage", params }), // 根据条件搜索文件用章,分页展示
  getBusinessInfo: (params = {}) => httpGet({ url: "eng/oaSeal/getBusinessInfo", params }), // 查询业务详情
  oaSealFindSealDetail: (params = {}) => httpGet({ url: "/eng/oaSeal/findSealDetail", params }), // 获取签章详情
  findProcessByType: (params = {}) => httpGet({ url: "/eng/oaSeal/findProcessByType", params }), // 获取流程类型
  searchManageCustom: (params = {}) => httpGet({ url: "/eng/projCustom/searchManageCustom", params }), // 项目部和施工子单位查询管理单位(建设子单位、监理单位和设计院)
  summaryContractSearchPage: (params = {}) => httpGet({ url: "/eng/summaryContract/searchPage", params }), // 查询合同汇总分页
  contractPie: (params = {}) => httpGet({ url: "/eng/summaryContract/contractPie", params }), // 查询合同金额所占饼图和汇总金额
  settleSummarySearchPage: (params = {}) => httpGet({ url: "/eng/settleSummary/searchPage", params }), // 计量汇总分页
  getSummaryAmount: (params = {}) => httpGet({ url: "/eng/settleSummary/getSummaryAmount", params }), // 计量汇总合计
  // getSummaryPie: (params = {}) => httpGet({ url: "/eng/query/settleSummary/getSummaryPie", params }), // 计量汇总饼图
  costSummarySearchPage: (params = {}) => httpGet({ url: "/eng/costSummary/searchPage", params }), // 成本汇总分页
  costSummaryGetSummaryAmount: (params = {}) => httpGet({ url: "/eng/costSummary/getSummaryAmount", params }), // 成本汇总合计
  // costSummaryGetSummaryPie: (params = {}) => httpGet({ url: "/eng/query/costSummary/getSummaryPie", params }), // 成本汇总饼图
  superiorSummarySearchPage: (params = {}) => httpGet({ url: "/eng/summaryFinance/searchPage", params }), // 查询财务汇总分页
  superiorSummaryReality: (params = {}) => httpGet({ url: "/eng/summaryFinance/financePie", params }), // 查询财务金额所占饼图和汇总金额
  summaryPlanSearchPage: (params = {}) => httpGet({ url: "/eng/summaryPlan/searchPage", params }), // 查询计划汇总分页
  getPlanPie: (params = {}) => httpGet({ url: "/eng/summaryPlan/planPie", params }), // 查询计划产值所占饼图和汇总产值
  superiorSummarySearchPage2: (params = {}) => httpGet({ url: "/eng/superiorSummaryReality/searchPage", params }), // 上级单位分页查询进度汇总
  getSuperiorSummary: (params = {}) => httpGet({ url: "/eng/superiorSummaryReality/superiorSummary", params }), // 上级单位查询进度汇总金额
  getProjectTreeByOrgType: (params = {}) => httpGet({ url: "/eng/public/getProjectTreeByOrgType", params }), // 获取当前组织所有项目树形集合
  actualSubCostSearchPage: (params = {}) => httpGet({ url: "/eng/costSummary/actualSubCostSearchPage", params }), // 分页查询实际成本的分包成本
  settleSummarySearchContracts: (params = {}) => httpGet({ url: "/eng/settleSummary/searchContracts", params }), // 根据条件查询合同(正常)
  settleSummarySummary: (params = {}) => httpGet({ url: "/eng/settleSummary/settleSummary", params }), // 计量汇总
  actualMaterialCostSearchPage: (params = {}) => httpGet({ url: "/eng/costSummary/actualMaterialCostSearchPage", params }), // 根据条件查询实际成本的物资成本，分页展示
  costSummaryCostSearchPage: (params = {}) => httpGet({ url: "/eng/costSummary/actualDeviceCostSearchPage", params }), // 分页查询实际成本的设备成本
  costSummarySearch: (params = {}) => httpGet({ url: "/eng/costSummary/search", params }), // 根据条件查询管理成本表
  costSummaryAccountList: (params = {}) => httpGet({ url: "/eng/costSummary/actualCostAccountList", params }), // 根据条件查询管理成本表
  summaryContractById: (params = {}) => httpGet({ url: "/eng/summaryContract/findContractById", params }), // 根据ID查询合同信息
  searchContractPage: (params = {}) => httpGet({ url: "/eng/summaryContract/searchContractPage", params }), // 根据条件查询合同，分页展示
  settlementSearchPage: (params = {}) => httpGet({ url: "/eng/settleSummary/settlementSearchPage", params }), // 根据条件查询合同，分页展示
  summaryFinanceFindById: (params = {}) => httpGet({ url: "/eng/summaryFinance/findById", params }), // 根据ID查询往来账表数据
  financeSearchPage: (params = {}) => httpGet({ url: "/eng/summaryFinance/financeSearchPage", params }), // 根据ID查询往来账表数据
  // 日常管理-项目管理
  projectInfoProjectSearchPage: (params = {}) => httpGet({ url: "/eng/projectInfo/projectSearchPage", params }), // 根据条件查询项目集，分页展示
  contractInfoTypeList: (params = {}) => httpGet({ url: "/eng/contractInfo/searchMajorTypeList", params }), // 查询专业类别下拉列表并根据合同所需分项工程集过滤
  contractInfoExportFile: (params = {}) => httpGet({ url: "/eng/contractInfo/batchExportFile", params }), // 导出合同清单
  contractInfoPrintExportFile: (params = {}) => httpGet({ url: "/eng/contractInfo/printExportFile", params }), // 打印合同清单
  projectInfoAddProject: (data = {}) => httpPost({ url: "/eng/projectInfo/addProject", data }), // 新增项目
  updateProject: (data = {}) => httpPut({ url: "/eng/projectInfo/updateProject", data }), // 根据ID修改项目信息
  findProjectById: (params = {}) => httpGet({ url: "/eng/projectInfo/findProjectById", params }), // 根据ID查询项目信息
  projectTableSearchPage: (params = {}) => httpGet({ url: "/eng/projectInfo/projectTableSearchPage", params }), // 分页查询工程项目
  projectInfoAddProjectTable: (data = {}) => httpPost({ url: "/eng/projectInfo/addProjectTable", data }), // 新增工程项目数据
  updateProjectTable: (data = {}) => httpPut({ url: "/eng/projectInfo/updateProjectTable", data }), // 根据ID修改工程项目数据
  findProjectTableById: (params = {}) => httpGet({ url: "/eng/projectInfo/findProjectTableById", params }), // 根据ID查询工程项目数据
  deleteProjectTable: (params = {}) => httpDelete({ url: "/eng/projectInfo/deleteProjectTable", params }), // 根据ID删除工程项目
  deleteProject: (params = {}) => httpDelete({ url: "eng/projectInfo/deleteProject", params }), // 根据ID删除项目
  contractInfoAdd: (data = {}) => httpPost({ url: "/eng/contractInfo/add", data }), // 新增合同
  findContractById: (params = {}) => httpGet({ url: "/eng/contractInfo/findContractById", params }), // 根据ID查询合同信息
  contractInfoDelete: (params = {}) => httpDelete({ url: "/eng/contractInfo/delete", params }), // 根据ID删除合同
  contractInfoConstant: (params = {}) => httpPut({ url: "/eng/contractInfo/terminationConstant", params }), // 根据ID终止合同
  contractInfoSearchPage: (params = {}) => httpGet({ url: "/eng/contractInfo/searchPage", params }), // 根据条件查询合同，分页展示
  contractInfoUpdate: (data = {}) => httpPut({ url: "/eng/contractInfo/update", data }), // 根据ID修改合同信息
  searchDetailSubitemByItemId: (params = {}) => httpGet({ url: "/eng/contractInfo/searchDetailSubitemByItemId", params }), // 根据分项工程ID集查询清单与工程关联数据
  contractByProIdAndType: (params = {}) => httpGet({ url: "/eng/contractInfo/searchDetailByProIdAndType", params }), // 根据项目ID和合同类型查询合同绑定的清单与分项工程关联数据
  contractInfoMajorTypeList: (params = {}) => httpGet({ url: "/eng/contractInfo/searchMajorTypeList", params }), // 查询专业类别下拉列表并根据合同所需分项工程集过滤
  contractInfoBatchExportFile: (params = {}) => httpGet({ url: "/eng/contractInfo/batchExportFile", params }), // 导出合同清单
  contractPrintExportFile: (params = {}) => httpGet({ url: "/eng/contractInfo/printExportFile", params }), // 打印合同清单
  customerInfoSearchPage: (params = {}) => httpGet({ url: "/eng/customerInfo/searchPage", params }), // 根据条件查询客户，分页展示
  projectProcessCheckSearchPage: (params = {}) => httpGet({ url: "/eng/projectProcessCheck/searchPage", params }), // 施工验收分页列表
  findProcessApproveById: (params = {}) => httpGet({ url: "/eng/projectProcessCheck/findProcessApproveById", params }), // 根据ID查询生产流程
  findWithdrawalProcessingNode: (data = {}) => httpPut({ url: "/eng/projectProcessCheck/withdrawalProcessingNode", data }), // 撤回流程节点
  processingNodeApproval: (data = {}) => httpPut({ url: "/eng/projectProcessCheck/processingNodeApproval", data }), // 处理流程节点
  projectTechnicalDisclosure: (params = {}) => httpGet({ url: "/eng/projectTechnicalDisclosure/searchPage", params }), // 根据条件查询技术交底，分页展示
  projectTechnicalDisclosureFindById: (params = {}) => httpGet({ url: "/eng/projectTechnicalDisclosure/findById", params }), // 根据ID查询技术交底
  projectTechnicalDisclosurePost: (data = {}) => httpPost({ url: "/eng/projectTechnicalDisclosure/updateEnableStatus", data }), // 根据ID接收或撤回技术交底
  projectTechnicalDisclosureAdd: (data = {}) => httpPost({ url: "/eng/projectTechnicalDisclosure/add", data }), // 新增技术交底
  projectTechnicalDisclosureCopy: (data = {}) => httpPost({ url: "/eng/projectTechnicalDisclosure/copy", data }), // 抄送技术交底
  projectTechnicalRetractCopy: (data = {}) => httpPost({ url: "/eng/projectTechnicalDisclosure/retractCopy", data }), // 撤回抄送
  projectSettlementSearchPage: (params = {}) => httpGet({ url: "/eng/projectSettlement/searchPage", params }), // 上级单位分页展示搜索项目计量
  projectSettlementProcessingNode: (data = {}) => httpPut({ url: "/eng/projectSettlement/withdrawalProcessingNode", data }), // 撤回流程节点
  projectTechnicalDisclosureUpdate: (data = {}) => httpPut({ url: "/eng/projectTechnicalDisclosure/update", data }), // 根据ID修改技术交底
  findStatsProjectSettleById: (data = {}) => httpPut({ url: "/eng/projectSettlement/findStatsProjectSettleById", data }), // 根据ID查看结算信息
  projectSettlementProjectExamine: (data = {}) => httpPut({ url: "/eng/projectSettlement/projectExamine", data }), // 审批计量结算
  changesDesignInfoSearchPage: (params = {}) => httpGet({ url: "/eng/changesDesignInfo/searchPage", params }), // 分页查询设计变更
  changesDesignInfoAdd: (data = {}) => httpPost({ url: "/eng/changesDesignInfo/add", data }), // 新增变更设计
  changesDesignInfoUpdate: (data = {}) => httpPut({ url: "/eng/changesDesignInfo/update", data }), // 修改变更设计
  changesDesignInfoDetail: (params = {}) => httpGet({ url: "/eng/changesDesignInfo/getDetail", params }), // 根据ID查询设计变更详情
  gnInfoGetChangeType: (params = {}) => httpGet({ url: "/eng/changesDesignInfo/getChangeType", params }), // 查询设计变更流程列表
  changesWithdrawActivity: (data = {}) => httpPut({ url: "/eng/changesDesignInfo/withdrawActivity", data }), // 撤回流程
  changesProcess: (data = {}) => httpPost({ url: "/eng/changesDesignInfo/approvalProcess", data }), // 审批流程
  changesGetWorkflowDetail: (params = {}) => httpGet({ url: "/eng/changesDesignInfo/getWorkflowDetail", params }), // 查询流程详情
  changesDesignInfoDelete: (params = {}) => httpDelete({ url: "/eng/changesDesignInfo/delete", params }), // 删除设计变更
  getWorkflowTable: (params = {}) => httpGet({ url: "/eng/changesDesignInfo/getWorkflowTable", params }), // 获取设计变更的表格
  changesChangeStatsQuery: (params = {}) => httpGet({ url: "/eng/changesDesignInfo/changeStatsQuery", params }), // 查询变更状态字典
  changesDesignInfoExport: (data = {}) => httpPost({ url: "/eng/changesDesignInfo/export", data }), // 变更设计导出
  changesDesignInfoPrintPDF: (data = {}) => httpPost({ url: "/eng/changesDesignInfo/printPDF", data }), // 变更设计打印
  prodItemApprovalRecordInfo: (params = {}) => httpGet({ url: "/eng/prodItemApprovalRecordInfo/searchPage", params }), // 根据条件查询流程审批记录表，分页展示
  prodItemApprovalRecordInfoFindById: (params = {}) => httpGet({ url: "/eng/prodItemApprovalRecordInfo/findById", params }), // 根据ID查询审批记录表数据
  approveExamine: (data = {}) => httpPut({ url: "/eng/prodItemApprovalRecordInfo/approveExamine", data }), // 批量审批流程审批记录
  searchItemByTemplateRecordInfo: (params = {}) => httpGet({ url: "/eng/prodItemApprovalRecordInfo/searchItemByTemplate", params }), // 根据流程模板ID集查询关联的审批分项工程树形
  searchApproveExamineStatsQuery: (params = {}) => httpGet({ url: "/eng/prodItemApprovalRecordInfo/approveExamineStatsQuery", params }), // 查询流程审批状态列表
  searchProject: (params = {}) => httpGet({ url: "/eng/public/searchProject", params }), // 获取当前组织的所有项目数据集
  projectBidByProjectId: (params = {}) => httpGet({ url: "/eng/public/projectBidByProjectId", params }), // 根据项目ID查询关联标段项目数据集
  getChildOrg: (params = {}) => httpGet({ url: "/eng/jurisdictionalOrg/getChildOrg", params }), // 获取子单位
  getUserList: (params = {}) => httpGet({ url: "/eng/jurisdictionalOrg/getUserList", params }), // 获取子单位人员
  commercialType: (params = {}) => httpGet({ url: "/operation/sysOrg/commercialType", params }), // 查询商户用户类型
  getProjectInfo: (params = {}) => httpGet({ url: "/eng/projectInfo/addProjectBid", params }), // 根据当前登录组织ID新增项目关联项目标段数据
  searchCompanyRole: (params = {}) => httpGet({ url: "/eng/oaArticle/searchCompanyRole", params }), // 查询当前登录组织的合作单位类型列表
  projectTechnicalDisclosureDelete: (params = {}) => httpDelete({ url: "/eng/projectTechnicalDisclosure/delete", params }), // 根据ID删除技术交底
  subsetOrgList: (params = {}) => httpGet({ url: "/operation/sysUser/subsetOrgList", params }), // 获取管理单位下拉列表
  subLedgerAmountDetail: (params = {}) => httpGet({ url: "eng/finance/subLedgerAmountDetail", params }), // 获取管理单位下拉列表
  teamClassSearch: (params = {}) => httpGet({ url: "/eng/labourTeam/teamClassSearch", params }), // 获取管理单位下拉列表
  labourTeamSearch: (params = {}) => httpGet({ url: "/eng/labourTeam/labourTeamSearch", params }), // 获取班组下拉列表
  availableTelephone: (params = {}) => httpGet({ url: "/operation/sysUser/availableTelephone", params }), // 查询账号是否已有人引用 false:无 true:有
  exportMaterial: (params = {}) => httpGet({ url: "/eng/prodItemList/exportMaterial", params }), // 查询账号是否已有人引用 false:无 true:有
  printPDFMaterial: (params = {}) => httpGet({ url: "/eng/prodItemList/printPDFMaterial", params }), // 查询账号是否已有人引用 false:无 true:有
  exportprodItem: (params = {}) => httpGet({ url: "/eng/prodItemList/export", params }), // 查询账号是否已有人引用 false:无 true:有
  printPDFprodItem: (params = {}) => httpGet({ url: "/eng/prodItemList/printPDF", params }), // 查询账号是否已有人引用 false:无 true:有
  printItemPdf: (params = {}) => httpGet({ url: "/eng/prodItemList/printItemPdf", params }), // 查询账号是否已有人引用 false:无 true:有
  exportItem: (params = {}) => httpGet({ url: "/eng/prodItemList/exportItem", params }), // 查询账号是否已有人引用 false:无 true:有
  searchprocessTablePage: (params = {}) => httpGet({ url: "/eng/processTable/searchPage", params }), // 查询账号是否已有人引用 false:无 true:有
  findprocessTableById: (params = {}) => httpGet({ url: "/eng/processTable/findById", params }), // 查询账号是否已有人引用 false:无 true:有
  updateprocessTable: (data = {}) => httpPut({ url: "/eng/processTable/update", data }), // 审批计量结算
  getAvailableDetailClass: (params = {}) => httpGet({ url: "eng/prodItemList/getAvailableDetailClass", params }), // 查询账号是否已有人引用 false:无 true:有
  getAllowableMaterials: (params = {}) => httpGet({ url: "eng/prodItemList/getAllowableMaterials", params }), // 查询账号是否已有人引用 false:无 true:有
  noticeReadPage: (params = {}) => httpGet({ url: "/eng/home/noticeReadPage", params }), // 查询账号是否已有人引用 false:无 true:有
  noticeReadPage2: (params = {}) => httpGet({ url: "operation/home/noticeReadPage", params }), // 查询账号是否已有人引用 false:无 true:有
  homeMeetingPage: (params = {}) => httpGet({ url: "/eng/home/homeMeetingPage", params }), // 查询账号是否已有人引用 false:无 true:有
  searchCustomArea: (params = {}) => httpGet({ url: "/eng/prodWorkArea/searchCustomArea", params }), // 查询账号是否已有人引用 false:无 true:有
  checkOrgName: (params = {}) => httpGet({ url: "/auth/checkOrgName", params }), // 账号注册校验企业名称
  getReadDetail: (params = {}) => httpGet({ url: "/eng/home/getReadDetail", params }), // 账号注册校验企业名称
  logUserList: (params = {}) => httpGet({ url: "/eng/prodConstructionJournal/searchUsers", params }), // 查询创建了施工日志的用户列表
  getRelease: (params = {}) => httpGet({ url: "/eng/home/getRelease", params }), // 获取我发布的信息
  getChildrenRouters: (params = {}) => httpGet({ url: "/operation/sysMenu/getChildrenRouters", params }), // 获取我发布的信息
  getNoticeRedPoint: (params = {}) => httpGet({ url: "/eng/home/getNoticeRedPoint", params }) // 首页新闻/公告/通知红点
};

export default api;
