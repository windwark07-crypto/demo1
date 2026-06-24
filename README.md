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
