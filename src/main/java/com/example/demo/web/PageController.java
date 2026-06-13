package com.example.demo.web;

import com.example.demo.menu.MenuService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    private final MenuService menuService;

    public PageController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("menus", menuService.findMenus());
        model.addAttribute("initialPageUrl", "/user/list");
        model.addAttribute("initialPageKey", "userList");
        return "layout";
    }

    @GetMapping("/user/list")
    public String userList() {
        return "user/list :: content";
    }

    @GetMapping("/user/detail")
    public String userDetail() {
        return "user/detail :: content";
    }

    @GetMapping("/product/list")
    public String productList() {
        return "product/list :: content";
    }

    @GetMapping("/product/detail")
    public String productDetail() {
        return "product/detail :: content";
    }

    @GetMapping("/order/list")
    public String orderList() {
        return "order/list :: content";
    }
}
