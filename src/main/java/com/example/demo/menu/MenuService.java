package com.example.demo.menu;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuService {

    public List<MenuItem> findMenus() {
        return List.of(
                new MenuItem("home", "홈", "/home", "home", "홈"),
                new MenuItem("user-list", "사용자 목록", "/user/list", "userList", "사용자"),
                new MenuItem("user-detail", "사용자 상세", "/user/detail", "userDetail", "사용자"),
                new MenuItem("product-list", "상품 목록", "/product/list", "productList", "상품"),
                new MenuItem("product-detail", "상품 상세", "/product/detail", "productDetail", "상품"),
                new MenuItem("order-list", "주문 목록", "/order/list", "orderList", "주문")
        );
    }
}
