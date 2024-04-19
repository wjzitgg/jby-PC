const contractStore = {
  state: {
    page: {
      pageNum: 1,
      pageSize: 10
    },
    TableList: []
  },
  mutations: {
    changePage(store, newpage) {
      store.page = newpage;
    },
    saveTableList(store, list) {
      store.TableList = list;
    }
  }
};

export default contractStore;
