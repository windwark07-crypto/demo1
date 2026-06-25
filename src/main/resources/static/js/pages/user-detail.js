window.AppPages = window.AppPages || {};

window.AppPages.userDetail = {
    init() {
        this.fillForm();
        this.bindEvents();
    },

    // 목록 화면에서 전달한 선택 사용자 정보를 폼에 채운다.
    fillForm() {
        const user = (window.AppContext && window.AppContext.selectedUser) || {};
        this.setValue("#detailUserId", user.userId);
        this.setValue("#detailUserName", user.userName);
        this.setValue("#detailRoleName", user.roleName);
        this.setValue("#detailStatus", user.status);
    },

    setValue(selector, value) {
        const el = document.querySelector(selector);
        if (el && value != null) {
            el.value = value;
        }
    },

    bindEvents() {
        // 목록 버튼 클릭 시 사용자 목록 화면으로 돌아간다.
        document.querySelector('[data-action="back"]')?.addEventListener("click", () => {
            AppRouter.navigate("/user/list", "userList");
        });
    }
};
