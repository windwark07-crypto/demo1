window.AppPages = window.AppPages || {};

window.AppPages.orderList = {
    grid: null,

    init() {
        this.initGrid();
        this.bindEvents();
        this.loadData();
    },

    initGrid() {
        const gridElement = document.querySelector("#orderGrid");
        this.grid = new tui.Grid({
            el: gridElement,
            bodyHeight: 460,
            columns: [
                {name: "orderId", header: "주문 ID", minWidth: 180, sortable: true},
                {name: "customerName", header: "고객명", minWidth: 140, sortable: true},
                {name: "orderDate", header: "주문일", minWidth: 140, sortable: true},
                {name: "status", header: "상태", minWidth: 100, sortable: true}
            ],
            data: []
        });
    },

    bindEvents() {
        document.querySelector('[data-action="reload"]')?.addEventListener("click", () => this.loadData());
    },

    async loadData() {
        const response = await Api.get("/orders");
        this.grid.resetData(response.data);
    }
};
