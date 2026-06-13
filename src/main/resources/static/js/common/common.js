(function () {
    const pageScripts = {
        userList: "/js/pages/user-list.js",
        userDetail: "/js/pages/user-detail.js",
        productList: "/js/pages/product-list.js",
        productDetail: "/js/pages/product-detail.js",
        orderList: "/js/pages/order-list.js"
    };

    const loadedScripts = new Set();

    async function loadScript(pageKey) {
        const src = pageScripts[pageKey];
        if (!src || loadedScripts.has(src)) {
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
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.body.appendChild(script);
        });
    }

    async function loadPage(url, pageKey) {
        const mainContent = document.querySelector("#mainContent");
        mainContent.innerHTML = '<div class="loading">화면을 불러오는 중입니다.</div>';

        const response = await fetch(url, {
            headers: {"X-Requested-With": "fetch"}
        });

        if (!response.ok) {
            throw new Error(`Fragment load failed: ${response.status}`);
        }

        mainContent.innerHTML = await response.text();
        await loadScript(pageKey);

        const pageModule = window.AppPages && window.AppPages[pageKey];
        if (pageModule && typeof pageModule.init === "function") {
            pageModule.init();
        }
    }

    function activateMenu(target) {
        document.querySelectorAll(".menu-item").forEach(item => item.classList.remove("active"));
        target.classList.add("active");
    }

    function bindMenu() {
        document.querySelectorAll(".menu-item").forEach(item => {
            item.addEventListener("click", async () => {
                activateMenu(item);
                await loadPage(item.dataset.url, item.dataset.page);
            });
        });
    }

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
