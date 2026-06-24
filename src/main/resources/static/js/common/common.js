(function () {
    // 이미 로드한 화면 스크립트는 다시 append하지 않도록 캐시한다.
    const loadedScripts = new Set();

    // REST API 호출은 공통 Axios 인스턴스를 통해 처리한다.
    window.Api = axios.create({
        baseURL: "/api",
        timeout: 10000,
        headers: {
            "Accept": "application/json"
        }
    });

    window.Api.interceptors.response.use(
        response => response,
        error => {
            console.error("API request failed", error);
            return Promise.reject(error);
        }
    );

    // pageKey(userList)를 파일명 규칙(user-list)으로 변환한다.
    function toKebabCase(value) {
        return value.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
    }

    // 메뉴의 pageKey를 기준으로 화면별 JS 경로를 만든다.
    function getPageScriptUrl(pageKey) {
        return `/js/pages/${toKebabCase(pageKey)}.js`;
    }

    // 화면 fragment에 대응되는 JS를 동적으로 로드한다.
    async function loadScript(pageKey) {
        if (!pageKey) {
            return;
        }

        const src = getPageScriptUrl(pageKey);
        if (loadedScripts.has(src)) {
            return;
        }

        await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.defer = true;
            script.onload = () => {
                loadedScripts.add(src);
                resolve();
            };
            script.onerror = () => {
                console.warn(`Page script not found: ${src}`);
                loadedScripts.add(src);
                resolve();
            };
            document.body.appendChild(script);
        });
    }

    // 서버에서 Thymeleaf fragment를 받아 메인 영역만 교체한다.
    async function loadPage(url, pageKey) {
        const mainContent = document.querySelector("#mainContent");
        mainContent.innerHTML = '<div class="loading">화면을 불러오는 중입니다.</div>';

        // REST 데이터 조회가 아니라 Thymeleaf fragment HTML을 가져오는 용도
        const response = await fetch(url, {
            headers: {"X-Requested-With": "fetch"}
        });

        if (!response.ok) {
            throw new Error(`Fragment load failed: ${response.status}`);
        }

        mainContent.innerHTML = await response.text();
        await loadScript(pageKey);

        // 화면별 모듈이 있으면 fragment 교체 후 초기화한다.
        const pageModule = window.AppPages && window.AppPages[pageKey];
        if (pageModule && typeof pageModule.init === "function") {
            pageModule.init();
        }
    }

    // 현재 선택된 메뉴만 active 상태로 표시한다.
    function activateMenu(target) {
        document.querySelectorAll(".menu-item").forEach(item => item.classList.remove("active"));
        target.classList.add("active");
    }

    // 메뉴 클릭 시 전체 페이지 이동 대신 메인 영역 fragment만 다시 로드한다.
    function bindMenu() {
        document.querySelectorAll(".menu-item").forEach(item => {
            item.addEventListener("click", async () => {
                activateMenu(item);
                await loadPage(item.dataset.url, item.dataset.page);
            });
        });
    }

    // 최초 진입 시 기본 메뉴를 활성화하고 초기 화면을 로드한다.
    document.addEventListener("DOMContentLoaded", async () => {
        bindMenu();

        const shell = document.querySelector(".app-shell");
        const firstMenu = document.querySelector(`.menu-item[data-page="${shell.dataset.initialPage}"]`)
                || document.querySelector(".menu-item");

        if (firstMenu) {
            activateMenu(firstMenu);
        }

        await loadPage(shell.dataset.initialUrl, shell.dataset.initialPage);
    });
})();
