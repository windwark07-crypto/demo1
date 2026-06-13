# 웹 서비스 아키텍처 요구사항 (v1.1)

## 1. 개요

Spring Boot + Thymeleaf 기반의 업무용 웹 서비스를 개발한다.

서비스는 좌측 메뉴(Left Menu)와 메인 컨텐츠(Main Content) 영역으로 구성되며, 메뉴 클릭 시 전체 페이지를 새로고침하지 않고 Main 영역만 변경되는 구조를 목표로 한다.

Grid 중심의 업무 시스템이며, 데이터는 REST API를 통해 조회한다.

---

# 2. 핵심 설계 원칙

## UI 렌더링

* Left Menu는 동적으로 생성
* Main 영역만 화면 전환
* 전체 페이지 리로드 없음

## 데이터 처리

* Grid 데이터는 서버 렌더링하지 않음
* 모든 조회 데이터는 REST API(JSON) 사용
* 화면 템플릿과 데이터 조회를 분리

## 아키텍처 방향

Thymeleaf는 화면 Layout 및 Fragment만 담당한다.

실제 업무 데이터는 REST API를 통해 조회한다.

---

# 3. 화면 구조

```text
┌──────────────┬─────────────────────────────┐
│              │                             │
│  Left Menu   │       Main Content          │
│              │                             │
└──────────────┴─────────────────────────────┘
```

## 요구사항

* Left Menu는 고정 영역
* Main Content만 변경
* SPA와 유사한 사용자 경험 제공
* 브라우저 전체 새로고침 최소화

---

# 4. 기술 스택

## Backend

* Spring Boot
* Spring MVC
* Spring Security
* Thymeleaf

## Frontend

* JavaScript (ES6+)
* Fetch API

## Grid

우선 고려

* AG Grid

대안

* RealGrid

---

# 5. 메뉴 관리 전략

## 목표

메뉴는 DB에서 관리한다.

소스 수정 없이 메뉴 추가/수정이 가능해야 한다.

---

## 메뉴 테이블 예시

### MENU

| 컬럼             | 설명     |
| -------------- | ------ |
| MENU_ID        | 메뉴 ID  |
| MENU_NAME      | 메뉴명    |
| MENU_URL       | 화면 URL |
| PARENT_MENU_ID | 상위 메뉴  |
| MENU_LEVEL     | 메뉴 깊이  |
| SORT_ORDER     | 정렬 순서  |
| USE_YN         | 사용 여부  |
| ICON           | 아이콘    |
| CREATED_AT     | 생성일    |

---

### ROLE_MENU

| 컬럼      | 설명    |
| ------- | ----- |
| ROLE_ID | 권한 ID |
| MENU_ID | 메뉴 ID |

---

## 메뉴 조회 방식

로그인 후

```text
사용자 로그인
        ↓
권한 조회
        ↓
메뉴 API 호출
        ↓
메뉴 JSON 수신
        ↓
Left Menu 생성
```

---

## 메뉴 API

### 메뉴 조회

```http
GET /api/menus
```

### 응답 예시

```json
[
  {
    "menuId": 1,
    "menuName": "사용자관리",
    "url": "/user/list",
    "children": []
  },
  {
    "menuId": 2,
    "menuName": "상품관리",
    "url": "/product/list",
    "children": []
  }
]
```

---

## 메뉴 렌더링

초기 로딩 시 JavaScript로 메뉴를 생성한다.

```javascript
const menus = await fetch("/api/menus")
    .then(res => res.json());

renderMenu(menus);
```

---

# 6. 화면 전환 전략

## 원하는 방식

```text
메뉴 클릭
        ↓
Fragment 요청
        ↓
Main 영역 교체
        ↓
Page.init()
        ↓
Grid 생성
        ↓
REST API 조회
        ↓
Grid 표시
```

---

## 사용하지 않는 방식

```text
메뉴 클릭
        ↓
전체 페이지 이동
        ↓
전체 HTML 재생성
```

---

# 7. 렌더링 전략

## Thymeleaf 담당 영역

* Layout
* Header
* Footer
* 공통 UI
* Fragment 템플릿
* 권한 처리

---

## REST API 담당 영역

* Grid 조회
* 검색
* 페이징
* 정렬
* CRUD

---

# 8. 데이터 조회 전략

## 예시

### 화면

```http
GET /user/list
```

응답

```html
<div id="userGrid"></div>
```

---

### 데이터

```http
GET /api/users
```

응답

```json
[
  {
    "userId": "user01",
    "userName": "홍길동"
  }
]
```

---

### Grid 바인딩

```javascript
gridApi.setGridOption(
    "rowData",
    responseData
);
```

---

# 9. 프로젝트 구조

## Template

```text
templates

├── layout
│   └── layout.html
│
├── user
│   ├── list.html
│   └── detail.html
│
├── product
│   ├── list.html
│   └── detail.html
│
└── order
    └── list.html
```

---

## JavaScript

```text
static/js

├── common
│   ├── router.js
│   ├── menu.js
│   └── api.js
│
└── pages
    ├── user-list.js
    ├── user-detail.js
    ├── product-list.js
    └── order-list.js
```

---

# 10. 페이지 초기화 규칙

각 화면은 독립적으로 초기화한다.

```javascript
const UserListPage = {

    init() {
        this.initGrid();
        this.bindEvents();
        this.loadData();
    },

    initGrid() {
    },

    bindEvents() {
    },

    loadData() {
    }
};
```

화면 로드 후

```javascript
UserListPage.init();
```

실행

---

# 11. URL 설계

## View URL

```text
/user/list
/user/detail

/product/list
/product/detail
```

---

## API URL

```text
/api/users
/api/products
/api/orders
```

View와 API를 명확히 분리한다.

---

# 12. 최종 아키텍처

```text
Spring Boot

├─ Thymeleaf
│     └ Fragment
│
├─ REST API
│     └ JSON
│
├─ Spring Security
│
└─ Menu API

          ↓

      Left Menu
      (동적 생성)

          ↓

     Main Content
     (Fragment 교체)

          ↓

        AG Grid

          ↓

      REST API
```

---

# 13. 최종 목표

* 메뉴는 DB 기반 동적 관리
* 권한별 메뉴 제공
* Main 영역만 교체
* Grid 데이터는 REST API 조회
* Thymeleaf는 Layout 및 Fragment만 담당
* SPA와 유사한 사용자 경험 제공
* React/Vue 없이 유지보수 가능한 업무 시스템 구축
* 메뉴 추가/수정 시 재배포 없이 운영 가능
* Grid 중심의 업무 화면 최적화
* 화면별 독립적인 JavaScript 모듈 구조 적용
