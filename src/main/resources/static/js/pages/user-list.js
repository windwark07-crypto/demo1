window.AppPages = window.AppPages || {};

window.AppPages.userList = {
    grid: null,

    init() {
        this.initGrid();
        this.bindEvents();
        this.loadData();
    },

    initGrid() {
        const gridElement = document.querySelector("#userGrid");
        this.grid = new tui.Grid({
            el: gridElement,
            bodyHeight: 460,
            columns: [
                {name: "userId", header: "사용자 ID", minWidth: 120, sortable: true},
                {name: "userName", header: "사용자명", minWidth: 120, sortable: true},
                {name: "roleName", header: "권한", minWidth: 120, sortable: true},
                {name: "status", header: "상태", minWidth: 100, sortable: true}
            ],
            data: []
        });
    },

    bindEvents() {
        document.querySelector('[data-action="reload"]')?.addEventListener("click", () => this.loadData());

        // Grid 행 클릭 시 선택한 사용자를 공유 컨텍스트에 담아 상세 화면으로 이동한다.
        this.grid.on("click", (ev) => {
            if (ev.rowKey == null) {
                return;
            }
            window.AppContext = window.AppContext || {};
            window.AppContext.selectedUser = this.grid.getRow(ev.rowKey);
            AppRouter.navigate("/user/detail", "userDetail");
        });
    },

    async loadData() {
        const response = await Api.get("/users");
        this.grid.resetData(response.data);
    }
};
