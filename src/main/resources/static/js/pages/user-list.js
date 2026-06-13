window.AppPages = window.AppPages || {};

window.AppPages.userList = {
    gridApi: null,

    init() {
        this.initGrid();
        this.bindEvents();
        this.loadData();
    },

    initGrid() {
        const gridElement = document.querySelector("#userGrid");
        const gridOptions = {
            defaultColDef: {
                flex: 1,
                minWidth: 120,
                sortable: true,
                filter: true,
                resizable: true
            },
            columnDefs: [
                {field: "userId", headerName: "사용자 ID"},
                {field: "userName", headerName: "사용자명"},
                {field: "roleName", headerName: "권한"},
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
        const response = await fetch("/api/users");
        const rows = await response.json();
        this.gridApi.setGridOption("rowData", rows);
    }
};
