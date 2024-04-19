import api from "@/api/api"
import Layout from '@/views/layout' //Layout 是架构组件，不在后台返回，在文件里单独引入

export const initMenu = (router,store) => {
  if (store.state.routes.length > 0) {
    return;
  }
  api.userLogin({ id: 10 }).then(data => {
    let res = data.data.router;
    if (res) {
      //格式和router
      let fmtRoutes = formatRoutes(res);
      //添加到router
      router.addRoutes(fmtRoutes);
      console.log(router.options.routes)
      //数据存入vuex
      store.commit('initRoutes',fmtRoutes)
    }
  })
} 

export function generaMenu(routes, data) {
  data.forEach(item => {
    // alert(JSON.stringify(item))
    const menu = {
      path: item.url === '#' ? item.menu_id + '_key' : item.url,
      component: item.url === '#' ? Layout : () => import(`@/views${item.url}/index`),
      // hidden: true,
      children: [],
      name: 'menu_' + item.menu_id,
      meta: { title: item.menu_name, id: item.menu_id, roles: ['admin'] }
    }
    if (item.children) {
      generaMenu(menu.children, item.children)
    }
    routes.push(menu)
  })
}

export const formatRoutes = (routes) => {
  let fmtRoutes = [];
  routes.forEach(router => {
    let {
      path,
      component,
      name,
      iconCls,
      children,
    } = router;
    if (children && children instanceof Array) {
      //递归
      children = formatRoutes(children);
    }

    let fmRouter = {
      path: path,
      name: name,
      iconCls: iconCls,
      component: () => import(`@/views/${component}/${component}.vue`)
    }
    fmtRoutes.push(fmRouter)
  })
  return fmtRoutes;
}