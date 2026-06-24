window.AppPages = window.AppPages || {};

window.AppPages.productList = {
    grid: null,

    init() {
        this.initGrid();
        this.bindEvents();
        this.loadData();
    },

    initGrid() {
        const gridElement = document.querySelector("#productGrid");
        this.grid = new tui.Grid({
            el: gridElement,
            bodyHeight: 460,
            columns: [
                {name: "productId", header: "상품 ID", minWidth: 130, sortable: true},
                {name: "productName", header: "상품명", minWidth: 180, sortable: true},
                {name: "category", header: "분류", minWidth: 130, sortable: true},
                {
                    name: "price",
                    header: "가격",
                    minWidth: 120,
                    align: "right",
                    sortable: true,
                    formatter: ({value}) => Number(value).toLocaleString()
                }
            ],
            data: []
        });
    },

    bindEvents() {
        document.querySelector('[data-action="reload"]')?.addEventListener("click", () => this.loadData());
    },

    async loadData() {
        const response = await Api.get("/products");
        this.grid.resetData(response.data);
    }
};
