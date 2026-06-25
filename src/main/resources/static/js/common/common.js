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

    // 화면 전환의 단일 진입점. 브라우저 히스토리 기록 여부(push)에 따라 분기한다.
    async function go(url, pageKey, push) {
        syncActiveMenu(pageKey);

        // 뒤로/앞으로 가기 시 선택 데이터(AppContext)까지 복원할 수 있도록 함께 저장한다.
        // 서버가 직접 진입(전체 레이아웃)을 지원하므로 주소창 URL도 실제로 변경한다.
        if (push) {
            history.pushState({url, pageKey, context: window.AppContext || {}}, "", url);
        }

        await loadPage(url, pageKey);
    }

    // fragment 내부 버튼 등에서 화면 전환을 호출할 수 있도록 라우터를 전역으로 노출한다.
    window.AppRouter = {
        navigate(url, pageKey) {
            return go(url, pageKey, true);
        }
    };

    // pageKey에 해당하는 메뉴만 active 상태로 표시한다.
    function syncActiveMenu(pageKey) {
        document.querySelectorAll(".menu-item").forEach(item => {
            item.classList.toggle("active", item.dataset.page === pageKey);
        });
    }

    // 메뉴 클릭 시 전체 페이지 이동 대신 메인 영역 fragment만 다시 로드한다.
    function bindMenu() {
        document.querySelectorAll(".menu-item").forEach(item => {
            item.addEventListener("click", () => go(item.dataset.url, item.dataset.page, true));
        });
    }

    // 브라우저 뒤로/앞으로 가기 시 히스토리 상태로 화면을 복원한다.
    window.addEventListener("popstate", (event) => {
        const state = event.state;
        if (!state || !state.pageKey) {
            return;
        }
        // 해당 시점의 화면 컨텍스트를 되살려 상세 화면 등이 데이터를 다시 표시할 수 있게 한다.
        window.AppContext = state.context || {};
        go(state.url, state.pageKey, false);
    });

    // 최초 진입 시 기본 메뉴를 활성화하고 초기 화면을 로드한다.
    document.addEventListener("DOMContentLoaded", async () => {
        bindMenu();

        const shell = document.querySelector(".app-shell");
        const initialUrl = shell.dataset.initialUrl;
        const initialPage = shell.dataset.initialPage;

        // 직접 진입/새로고침 시 서버가 내려준 초기 화면 정보를 현재 히스토리 항목(현재 URL)에 붙인다.
        history.replaceState({url: initialUrl, pageKey: initialPage, context: {}}, "", initialUrl);
        await go(initialUrl, initialPage, false);
    });
})();
