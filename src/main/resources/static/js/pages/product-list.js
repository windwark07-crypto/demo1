window.AppPages = window.AppPages || {};

window.AppPages.productList = {
    gridApi: null,

    init() {
        this.initGrid();
        this.bindEvents();
        this.loadData();
    },

    initGrid() {
        const gridElement = document.querySelector("#productGrid");
        const gridOptions = {
            defaultColDef: {
                flex: 1,
                minWidth: 130,
                sortable: true,
                filter: true,
                resizable: true
            },
            columnDefs: [
                {field: "productId", headerName: "상품 ID"},
                {field: "productName", headerName: "상품명"},
                {field: "category", headerName: "분류"},
                {field: "price", headerName: "가격", valueFormatter: params => Number(params.value).toLocaleString()}
            ],
            rowData: []
        };

        this.gridApi = agGrid.createGrid(gridElement, gridOptions);
    },

    bindEvents() {
        document.querySelector('[data-action="reload"]')?.addEventListener("click", () => this.loadData());
    },

    async loadData() {
        const response = await fetch("/api/products");
        const rows = await response.json();
        this.gridApi.setGridOption("rowData", rows);
    }
};
