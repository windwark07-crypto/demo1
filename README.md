# demo1

## 메뉴 클릭 동작 흐름

`layout.html`의 `aside` 영역에는 `MenuService`에서 전달한 메뉴 목록이 버튼으로 렌더링된다.

```html
<button type="button"
        class="menu-item"
        th:each="menu : ${menus}"
        th:text="${menu.name()}"
        th:attr="data-url=${menu.fragmentUrl()}, data-page=${menu.pageKey()}">
    메뉴
</button>
```

각 버튼에는 화면 fragment URL과 화면 식별자가 `data-*` 속성으로 들어간다.

```html
data-url="/user/list"
data-page="userList"
```

사용자가 메뉴 버튼을 클릭하면 `common.js`의 `bindMenu()`에서 등록한 클릭 이벤트가 실행된다.

```javascript
document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", async () => {
        activateMenu(item);
        await loadPage(item.dataset.url, item.dataset.page);
    });
});
```

클릭 후 처리 순서는 다음과 같다.

1. `activateMenu(item)`을 실행해 기존 메뉴의 `active` 클래스를 제거하고 클릭한 메뉴에만 `active` 클래스를 추가한다.
2. `loadPage(item.dataset.url, item.dataset.page)`를 실행한다.
3. `#mainContent` 영역에 로딩 문구를 표시한다.
4. `fetch(url)`로 서버에 Thymeleaf fragment를 요청한다.
5. `PageController`가 해당 URL에 맞는 `template :: content` fragment를 반환한다.
6. 응답받은 HTML로 `#mainContent`를 교체한다.
7. `pageKey`를 파일명 규칙으로 변환해 화면별 JS를 로드한다.
8. `window.AppPages[pageKey].init()`이 있으면 실행한다.
9. 화면별 초기화 로직에서 Grid 생성, 이벤트 바인딩, API 조회 등을 수행한다.

예를 들어 사용자 목록 메뉴를 클릭하면 다음과 같이 동작한다.

```text
사용자 목록 클릭
-> active 메뉴 변경
-> GET /user/list
-> user/list :: content fragment 반환
-> #mainContent 교체
-> /js/pages/user-list.js 로드
-> window.AppPages.userList.init()
-> Toast UI Grid 생성
-> Api.get("/users")로 데이터 조회
-> Grid에 조회 결과 표시
```

화면별 JS 경로는 `pageKey`를 기준으로 자동 생성된다.

```text
userList      -> /js/pages/user-list.js
productDetail -> /js/pages/product-detail.js
orderList     -> /js/pages/order-list.js
```

따라서 새 메뉴를 추가할 때는 `pageKey`, fragment URL, 화면별 JS 파일명 규칙을 맞춰야 한다.

## 화면 추가 시 스크립트 매핑 규칙

초기 구조에서는 `common.js`에 화면별 스크립트 경로를 직접 정의하는 `pageScripts` 객체가 필요했다.

```javascript
const pageScripts = {
    userList: "/js/pages/user-list.js",
    userDetail: "/js/pages/user-detail.js",
    productList: "/js/pages/product-list.js",
    productDetail: "/js/pages/product-detail.js",
    orderList: "/js/pages/order-list.js"
};
```

이 방식에서는 새 화면을 추가할 때마다 `pageKey`와 JS 파일 경로를 `pageScripts`에 직접 추가해야 한다.

예를 들어 고객 목록 화면을 추가한다면 다음 매핑이 필요하다.

```javascript
customerList: "/js/pages/customer-list.js"
```

`pageScripts`가 필요했던 이유는 메뉴 버튼에는 `data-page="customerList"`처럼 화면 식별자만 있고, 브라우저가 이 값만으로 실제 JS 파일 경로를 알 수 없기 때문이다.

현재 구조에서는 이 하드코딩을 줄이기 위해 `pageKey`를 파일명으로 변환하는 규칙 기반 방식을 사용한다.

```javascript
function toKebabCase(value) {
    return value.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
}

function getPageScriptUrl(pageKey) {
    return `/js/pages/${toKebabCase(pageKey)}.js`;
}
```

따라서 `pageScripts` 객체를 매번 수정하지 않아도 된다. 대신 아래 규칙을 반드시 지켜야 한다.

| 항목 | 규칙 | 예시 |
| --- | --- | --- |
| `pageKey` | camelCase 사용 | `customerList` |
| JS 파일명 | kebab-case 사용 | `customer-list.js` |
| JS 파일 위치 | `/static/js/pages/` 아래에 생성 | `/static/js/pages/customer-list.js` |
| JS 모듈명 | `window.AppPages[pageKey]`와 일치 | `window.AppPages.customerList` |
| 초기화 함수 | `init()` 함수 제공 | `window.AppPages.customerList.init()` |

고객 목록 화면을 추가하는 경우 예시는 다음과 같다.

`MenuService` 또는 DB 메뉴 데이터:

```text
fragmentUrl: /customer/list
pageKey: customerList
```

JS 파일 경로:

```text
src/main/resources/static/js/pages/customer-list.js
```

JS 모듈:

```javascript
window.AppPages = window.AppPages || {};

window.AppPages.customerList = {
    init() {
        // 화면 초기화
    }
};
```

만약 화면에 별도 JS가 필요 없다면 JS 파일을 만들지 않아도 된다. 이 경우 `common.js`는 콘솔에 경고만 출력하고 fragment 화면은 그대로 표시한다.

```text
Page script not found: /js/pages/customer-list.js
```

## fragment 내부에서 화면 전환 (AppRouter)

좌측 메뉴 클릭 외에, fragment 내부의 버튼이나 Grid에서도 다른 화면으로 전환할 수 있도록 `common.js`가 라우터를 전역으로 노출한다.

```javascript
window.AppRouter = {
    navigate(url, pageKey) {
        return go(url, pageKey, true);
    }
};
```

화면별 JS 어디서든 아래처럼 호출하면 메인 영역이 교체된다.

```javascript
AppRouter.navigate("/user/detail", "userDetail");
```

`navigate()`는 내부 단일 진입점 `go(url, pageKey, push)`를 호출한다. `go()`는 메뉴 active 동기화 → 브라우저 히스토리 기록 → fragment 로드 → `init()` 실행을 한 번에 처리한다.

## 선언적 화면 전환 (data 속성 위임)

`AppRouter.navigate()`를 직접 호출하는 대신, HTML 속성만 선언해 화면을 전환할 수도 있다. `common.js`가 `document`에 클릭 리스너를 **한 번만** 등록해 `data-nav-url` 속성을 가진 요소 클릭을 위임으로 처리한다.

```javascript
// common.js: 한 번만 등록 (fragment가 교체돼도 재바인딩 불필요)
function bindNav() {
    document.addEventListener("click", (event) => {
        const nav = event.target.closest("[data-nav-url]");
        if (!nav) {
            return;
        }
        go(nav.dataset.navUrl, nav.dataset.navPage, true);
    });
}
```

fragment에서는 속성만 선언하면 되고, 별도 JS가 필요 없다.

```html
<button type="button" data-nav-url="/user/detail" data-nav-page="userDetail">상세</button>
```

> 메뉴 버튼은 `data-url`/`data-page`(개별 바인딩)를 그대로 쓰고, 위임 방식은 `data-nav-url`/`data-nav-page`로 속성명을 구분해 충돌을 막는다.

두 방식은 함께 쓴다. 정적인 바로가기는 `data-nav-*` 속성으로 선언하고, 클릭 시점에 값이 정해지는 동적 이동(예: 선택한 Grid 행 id)은 `AppRouter.navigate()`를 직접 호출한다.

## 목록 → 상세 화면 이동

화면 간 선택 데이터는 `window.AppContext` 공유 객체로 전달한다. 사용자 목록에서 Grid 행을 클릭하면 선택한 행을 `AppContext`에 담고 상세 화면으로 이동한다.

```javascript
// user-list.js
this.grid.on("click", (ev) => {
    if (ev.rowKey == null) {
        return;
    }
    window.AppContext = window.AppContext || {};
    window.AppContext.selectedUser = this.grid.getRow(ev.rowKey);
    AppRouter.navigate("/user/detail", "userDetail");
});
```

상세 화면은 `init()` 시점에 `AppContext`를 읽어 폼을 채우고, "목록" 버튼으로 다시 돌아간다.

```javascript
// user-detail.js
fillForm() {
    const user = (window.AppContext && window.AppContext.selectedUser) || {};
    this.setValue("#detailUserId", user.userId);
    this.setValue("#detailUserName", user.userName);
    // ...
}
```

## 딥링크와 브라우저 뒤로가기 (History API)

화면 전환 시 주소창 URL을 실제로 변경해, 북마크·URL 공유·새로고침·뒤로가기를 지원한다.

### 클라이언트

`go()`는 화면 전환 시 `history.pushState`로 실제 URL을 기록하고, 선택 데이터(`AppContext`)도 state에 함께 저장한다. 뒤로/앞으로 가기는 `popstate`에서 그 state로 화면과 컨텍스트를 복원한다.

```javascript
async function go(url, pageKey, push) {
    syncActiveMenu(pageKey);
    if (push) {
        history.pushState({url, pageKey, context: window.AppContext || {}}, "", url);
    }
    await loadPage(url, pageKey);
}

window.addEventListener("popstate", (event) => {
    const state = event.state;
    if (!state || !state.pageKey) {
        return;
    }
    window.AppContext = state.context || {};
    go(state.url, state.pageKey, false);
});
```

### 서버

같은 URL(`/user/list`)이 요청 유형에 따라 두 가지로 응답한다. 그래서 주소창을 바꿔도 새로고침·직접 진입이 깨지지 않는다.

| 요청 | 식별 | 응답 |
| --- | --- | --- |
| fetch(fragment) | `X-Requested-With: fetch` 헤더 있음 | `template :: content` fragment |
| 직접 진입 / 새로고침 | 헤더 없음 | 해당 화면을 초기 화면으로 한 전체 `layout` |

```java
// PageController
private boolean isFragmentRequest(HttpServletRequest request) {
    return "fetch".equals(request.getHeader("X-Requested-With"));
}

private String render(HttpServletRequest request, String viewPath, String pageKey, Model model) {
    if (isFragmentRequest(request)) {
        return viewPath + " :: content";
    }
    model.addAttribute("menus", menuService.findMenus());
    model.addAttribute("initialPageUrl", request.getRequestURI());
    model.addAttribute("initialPageKey", pageKey);
    return "layout";
}
```

> 딥링크 범위는 목록/상위 화면까지다. 상세 화면(`/user/detail`)을 URL로 직접 진입하면 레이아웃은 정상 로드되지만 선택 컨텍스트가 없어 빈 폼으로 표시된다.

## 홈 화면

루트 경로(`/`)는 홈(대시보드) 화면으로 진입한다.

```text
/            -> layout (초기 화면 /home)
/home        -> home :: content fragment
pageKey      -> home
```

홈의 바로가기 카드는 위의 **선언적 위임 방식**(`data-nav-url`/`data-nav-page`)으로 각 업무 화면에 이동한다. 별도 바인딩 JS가 없어 `/js/pages/home.js`는 두지 않는다(`common.js`가 콘솔 경고만 출력). 좌측 메뉴 맨 위 "홈" 항목으로 언제든 복귀할 수 있다.
