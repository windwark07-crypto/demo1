window.AppPages = window.AppPages || {};

window.AppPages.orderList = {
    gridApi: null,

    init() {
        this.initGrid();
        this.bindEvents();
        this.loadData();
    },

    initGrid() {
        const gridElement = document.querySelector("#orderGrid");
        const gridOptions = {
            defaultColDef: {
                flex: 1,
                minWidth: 140,
                sortable: true,
                filter: true,
                resizable: true
            },
            columnDefs: [
                {field: "orderId", headerName: "주문 ID"},
                {field: "customerName", headerName: "고객명"},
                {field: "orderDate", headerName: "주문일"},
                {field: "status", headerName: "상태"}
            ],
            rowData: []
        };

        this.gridApi = agGrid.createGrid(gridElement, gridOptions);
    },

    bindEvents() {
        document.querySelector('[data-action="reload"]')?.addEventListener("click", () => this.loadData());
    },

    async loadData() {
        const response = await fetch("/api/orders");
        const rows = await response.json();
        this.gridApi.setGridOption("rowData", rows);
    }
};
