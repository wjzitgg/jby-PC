import Vue from "vue";
import Router from "vue-router";
import Layout from "@/views/layout"; // Layout 是架构组件，不在后台返回，在文件里单独引入
Vue.use(Router);

export const constantRouterMap = [
  {
    path: "",
    redirect: "home/home"
  },
  {
    path: "/home",
    component: Layout,
    redirect: "home/home",
    children: [
      {
        path: "home/home",
        component: () => import("@/views/home.vue"),
        meta: {
          title: "首页",
          icon: "home"
        }
      },
      {
        path: "todo",
        component: () => import("../views/home/todo.vue"),
        meta: { title: "待办事项", hidden: true }
      },
      {
        path: "notice",
        component: () => import("../views/home/notice.vue"),
        meta: { title: "会议通知", hidden: true }
      },
      {
        path: "news",
        component: () => import("../views/home/news.vue"),
        meta: { title: "公司新闻", hidden: true }
      },
      {
        path: "affiche",
        component: () => import("../views/home/affiche.vue"),
        meta: { title: "公司公告", hidden: true }
      }
    ]
  },
  // {
  //   path: "/system",
  //   component: Layout,
  //   redirect: "/system/role",
  //   name: "System",
  //   meta: {
  //     title: "系统管理",
  //     icon: "system"
  //   },
  //   children: [{
  //       path: "role",
  //       name: "Role",
  //       component: () => import('../views/system/role.vue'),
  //       meta: {
  //         title: "系统角色",
  //         icon: "role"
  //       }
  //     },
  //     {
  //       path: "charging",
  //       name: "Charging",
  //       component: () => import('../views/system/charging.vue'),
  //       meta: {
  //         title: "收费模式",
  //       }
  //     },
  //     {
  //       path: "business",
  //       name: "business",
  //       component: () => import('../views/system/business.vue'),
  //       meta: {
  //         title: "商务用户",
  //         icon: "business"
  //       }
  //     },
  //     {
  //       path: "breakdown",
  //       name: "breakdown",
  //       component: () => import('../views/system/breakdown.vue'),
  //       meta: {
  //         title: "系统分项表",
  //         icon: "breakdown"
  //       }
  //     },
  //     {
  //       path: "process",
  //       name: "system/process",
  //       component: () => import('../views/system/process.vue'),
  //       meta: {
  //         title: "流程设置",
  //         icon: "process"
  //       }
  //     },
  //     {
  //       path: "technical",
  //       name: "technical",
  //       component: () => import('../views/system/technical.vue'),
  //       meta: {
  //         title: "技术规范",
  //         icon: "technical"
  //       }
  //     },
  //     {
  //       path: "security",
  //       name: "Security",
  //       component: () => import('../views/system/security.vue'),
  //       meta: {
  //         title: "安全规范",
  //         icon: "security"
  //       }
  //     },
  //     {
  //       path: "acceptance",
  //       name: "Acceptance",
  //       component: () => import('../views/system/acceptance.vue'),
  //       meta: {
  //         title: "验收标准",
  //         icon: "acceptance"
  //       }
  //     },
  //     {
  //       path: "form",
  //       name: "form",
  //       component: () => import('../views/system/form.vue'),
  //       meta: {
  //         title: "表格管理",
  //         icon: "form"
  //       }
  //     },
  //     {
  //       path: "material",
  //       name: "material",
  //       component: () => import('../views/system/material.vue'),
  //       meta: {
  //         title: "物料信息",
  //         icon: "material"
  //       }
  //     },
  //     {
  //       path: "projectDetails",
  //       name: "projectDetails",
  //       component: () => import('../views/system/projectDetails.vue'),
  //       meta: {
  //         title: "清单项目",
  //         icon: "projectDetails"
  //       }
  //     },
  //   ]
  // },
  // {
  //   path: "/org",
  //   name: 'Org',
  //   component: Layout,
  //   meta: {
  //     title: "组织机构",
  //     icon: "example"
  //   },
  //   children: [
  //     {
  //       path: "dept",
  //       name: "dept",
  //       component: () => import('../views/org/dept.vue'),
  //       meta: {
  //         title: "部门管理",
  //         icon: "dept"
  //       }
  //     },
  //     {
  //       path: "role",
  //       name: "role",
  //       component: () => import('../views/org/role.vue'),
  //       meta: {
  //         title: "角色管理",
  //         icon: "role"
  //       }
  //     },
  //     {
  //       path: "jurisdiction",
  //       name: "jurisdiction",
  //       component: () => import('../views/org/jurisdiction.vue'),
  //       meta: {
  //         title: "所辖项目",
  //         icon: "jurisdiction"
  //       }
  //     },
  //     {
  //       path: "user",
  //       name: "user",
  //       component: () => import('../views/org/user.vue'),
  //       meta: {
  //         title: "员工管理",
  //         icon: "user"
  //       }
  //     },
  //   ]
  // },
  // {
  //   path: "/project",
  //   name: 'project',
  //   component: Layout,
  //   meta: {
  //     title: "项目信息",
  //     icon: "example"
  //   },
  //   children: [
  //     {
  //       path: "survey",
  //       name: "survey",
  //       component: () => import('../views/project/survey.vue'),
  //       meta: {
  //         title: "项目概括",
  //         icon: "survey"
  //       }
  //     },
  //     {
  //       path: "item",
  //       name: "item",
  //       component: () => import('../views/project/item.vue'),
  //       meta: {
  //         title: "工程项目表",
  //         icon: "item"
  //       }
  //     },
  //   ]
  // },
  // {
  //   path: "/customer",
  //   name: 'Customer',
  //   component: Layout,
  //   meta: {
  //     title: "客户管理",
  //     icon: "customer"
  //   },
  //   children: [
  //     {
  //       path: "build",
  //       name: "build",
  //       component: () => import('../views/customer/build.vue'),
  //       meta: {
  //         title: "建设单位",
  //         icon: "build"
  //       }
  //     },
  //     {
  //       path: "supervisor",
  //       name: "supervisor",
  //       component: () => import('../views/customer/supervisor.vue'),
  //       meta: {
  //         title: "监理公司",
  //         icon: "supervisor"
  //       }
  //     },
  //     {
  //       path: "project",
  //       name: "/customer/project",
  //       component: () => import('../views/customer/project.vue'),
  //       meta: {
  //         title: "项目部",
  //         icon: "project"
  //       }
  //     },
  //     {
  //       path: "subcontractor",
  //       name: "Subcontractor",
  //       component: () => import('../views/customer/subcontractor.vue'),
  //       meta: {
  //         title: "分包单位",
  //         icon: "subcontractor"
  //       }
  //     },
  //     {
  //       path: "supplier",
  //       name: "Supplier",
  //       component: () => import('../views/customer/supplier.vue'),
  //       meta: {
  //         title: "供应商",
  //         icon: "supplier"
  //       }
  //     },
  //   ]
  // },
  // {
  //   path: "/production",
  //   name: 'Production',
  //   component: Layout,
  //   meta: {
  //     title: "生产管理",
  //     icon: "customer"
  //   },
  //   children: [
  //     {
  //       path: "setting",
  //       name: "setting",
  //       component: () => import('../views/production/setting.vue'),
  //       meta: {
  //         title: "生产设置",
  //         icon: "setting"
  //       }
  //     },
  //     {
  //       path: "process",
  //       name: "production/process",
  //       component: () => import('../views/production/process.vue'),
  //       meta: {
  //         title: "施工验收",
  //         icon: "process"
  //       }
  //     },
  //   ]
  // },
  // {
  //   path: "/contract",
  //   name: 'Contract',
  //   component: Layout,
  //   meta: {
  //     title: "合同管理",
  //     icon: "contract"
  //   },
  //   children: [
  //     {
  //       path: "construction",
  //       name: "Construction",
  //       component: () => import('../views/contract/construction.vue'),
  //       meta: {
  //         title: "施工合同",
  //         icon: "construction"
  //       }
  //     },
  //     {
  //       path: "subcontractor",
  //       name: "subcontractor",
  //       component: () => import('../views/contract/subcontractor.vue'),
  //       meta: {
  //         title: "分包合同",
  //       }
  //     },
  //     {
  //       path: "supervisor",
  //       name: "Supervisor",
  //       component: () => import('../views/contract/supervisor.vue'),
  //       meta: {
  //         title: "监理合同",
  //       }
  //     },
  //     {
  //       path: "supplier",
  //       name: "supplier",
  //       component: () => import('../views/contract/supplier.vue'),
  //       meta: {
  //         title: "供货合同",
  //       }
  //     },
  //   ]
  // },
  // {
  //   path: "/schedule",
  //   name: 'schedule',
  //   component: Layout,
  //   meta: {
  //     title: "进度管理",
  //     icon: "schedule"
  //   },
  //   children: [
  //     {
  //       path: "actual",
  //       name: "actual",
  //       component: () => import('../views/schedule/actual.vue'),
  //       meta: {
  //         title: "实际完成",
  //       }
  //     },
  //     {
  //       path: "year",
  //       name: "year",
  //       component: () => import('../views/schedule/year.vue'),
  //       meta: {
  //         title: "年度计划",
  //       }
  //     },
  //     {
  //       path: "monthly",
  //       name: "monthly",
  //       component: () => import('../views/schedule/monthly.vue'),
  //       meta: {
  //         title: "月度计划",
  //       }
  //     },
  //     {
  //       path: "summary",
  //       name: "summary",
  //       component: () => import('../views/schedule/summary.vue'),
  //       meta: {
  //         title: "进度汇总",
  //       }
  //     },
  //     {
  //       path: "quarter",
  //       name: "quarter",
  //       component: () => import('../views/schedule/quarter.vue'),
  //       meta: {
  //         title: "季度计划",
  //       }
  //     },

  //   ]
  // },
  // {
  //   path: "/quality",
  //   name: 'Quality',
  //   component: Layout,
  //   meta: {
  //     title: "质量管理",
  //     icon: "quality"
  //   },
  //   children: [
  //     {
  //       path: "with",
  //       name: "quality/with",
  //       component: () => import('../views/quality/with.vue'),
  //       meta: {
  //         title: "质量同步",
  //       }
  //     },
  //   ]
  // },
  // {
  //   path: "/security",
  //   name: 'security',
  //   component: Layout,
  //   meta: {
  //     title: "安全管理",
  //     icon: "security"
  //   },
  //   children: [
  //     {
  //       path: "with",
  //       name: "with",
  //       component: () => import('../views/security/with.vue'),
  //       meta: {
  //         title: "安全同步",
  //       }
  //     },
  //   ]
  // },
  // {
  //   path: "/settlement",
  //   name: 'Settlement',
  //   component: Layout,
  //   meta: {
  //     title: "结算管理",
  //     icon: "settlement"
  //   },
  //   children: [
  //     {
  //       path: "owner",
  //       name: "Owner",
  //       component: () => import('../views/settlement/owner.vue'),
  //       meta: {
  //         title: "业主计量",
  //       }
  //     },
  //     {
  //       path: "project",
  //       name: "settlement/project",
  //       component: () => import('../views/settlement/project.vue'),
  //       meta: {
  //         title: "项目结算",
  //       }
  //     },
  //     {
  //       path: "summary",
  //       name: "Summary",
  //       component: () => import('../views/settlement/summary.vue'),
  //       meta: {
  //         title: "结算汇总",
  //       }
  //     },
  //     {
  //       path: "subcontractor",
  //       name: "settlement/subcontractor",
  //       component: () => import('../views/settlement/subcontractor.vue'),
  //       meta: {
  //         title: "分包计价",
  //       }
  //     },
  //   ]
  // },
  {
    path: "/registry",
    name: "registry",
    component: () => import("@/views/login/registry.vue"), // 注册
    hidden: true
  },
  {
    path: "/forgetPassword",
    name: "forgetPassword",
    component: () => import("@/views/login/forgetPassword.vue"), // 忘记密码
    hidden: true
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/login/index"),
    hidden: true
  },
  {
    path: "/empty",
    component: () => import("@/views/empty"),
    hidden: true,
    name: "empty"
  },
  {
    path: "/404",
    component: () => import("@/views/404"),
    hidden: true
  },
  {
    path: "*",
    component: () => import("@/views/404"),
    hidden: true
  }
];

const createRouter = () => new Router({
  routes: constantRouterMap
});
const router = createRouter();
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // 新路由实例matcer，赋值给旧路由实例的matcher，（相当于replaceRouter）
}
export default router;
// new Router({
//   routes: constantRouterMap
//   // mode:"history",
// });
