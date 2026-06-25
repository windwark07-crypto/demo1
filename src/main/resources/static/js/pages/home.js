window.AppPages = window.AppPages || {};

window.AppPages.home = {
    init() {
        // 바로가기 카드 클릭 시 해당 화면으로 이동한다.
        document.querySelectorAll(".home-card").forEach(card => {
            card.addEventListener("click", () => {
                AppRouter.navigate(card.dataset.url, card.dataset.page);
            });
        });
    }
};
