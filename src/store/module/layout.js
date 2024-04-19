import router from "@/router";

const layoutStore = {
  state() {
    return {
      editableTabsValue: "",
      editableTabs: [],
      tabIndex: 1
    };
  },
  mutations: {
    // 选中首页
    checkHome(store) {
      store.editableTabsValue = "动态首页";
    },
    // 添加tab
    addTab(store, to) {
      let targetName = to.meta.title;
      if (!store.editableTabs.some(item => item.title === targetName)) {
        store.editableTabs = [
          ...store.editableTabs,
          {
            title: targetName,
            name: targetName,
            url: to.path
          }
        ];
      }
      store.editableTabsValue = targetName;
    },
    // 移除Tab
    removeTab(store, targetName) {
      let tabs = store.editableTabs;
      let activeName = store.editableTabsValue;
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            let nextTab = tabs[index + 1] || tabs[index - 1];
            if (nextTab) {
              activeName = nextTab.name;
            }
          }
        });
      }
      store.editableTabsValue = activeName;
      store.editableTabs = tabs.filter(tab => tab.name !== targetName);
    },
    // 选中tab
    clickTab(store) {
      const tab = store.editableTabs.filter(
        item => item.title === store.editableTabsValue
      )[0];
      if (!tab) return router.push("/");
      router.push(tab.url);
    }
  }
};
export default layoutStore;
