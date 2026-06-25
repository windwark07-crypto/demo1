package com.example.demo.web;

import com.example.demo.menu.MenuService;
import jakarta.servlet.http.HttpServletRequest;
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
        model.addAttribute("initialPageUrl", "/home");
        model.addAttribute("initialPageKey", "home");
        return "layout";
    }

    @GetMapping("/home")
    public String home(HttpServletRequest request, Model model) {
        return render(request, "home", "home", model);
    }

    @GetMapping("/user/list")
    public String userList(HttpServletRequest request, Model model) {
        return render(request, "user/list", "userList", model);
    }

    @GetMapping("/user/detail")
    public String userDetail(HttpServletRequest request, Model model) {
        return render(request, "user/detail", "userDetail", model);
    }

    @GetMapping("/product/list")
    public String productList(HttpServletRequest request, Model model) {
        return render(request, "product/list", "productList", model);
    }

    @GetMapping("/product/detail")
    public String productDetail(HttpServletRequest request, Model model) {
        return render(request, "product/detail", "productDetail", model);
    }

    @GetMapping("/order/list")
    public String orderList(HttpServletRequest request, Model model) {
        return render(request, "order/list", "orderList", model);
    }

    // 클라이언트 loadPage()가 보내는 X-Requested-With 헤더로 fetch(fragment) 요청을 식별한다.
    private boolean isFragmentRequest(HttpServletRequest request) {
        return "fetch".equals(request.getHeader("X-Requested-With"));
    }

    // fetch 요청이면 fragment만, 직접 진입/새로고침이면 해당 화면을 초기 화면으로 한 전체 레이아웃을 반환한다.
    private String render(HttpServletRequest request, String viewPath, String pageKey, Model model) {
        if (isFragmentRequest(request)) {
            return viewPath + " :: content";
        }
        model.addAttribute("menus", menuService.findMenus());
        model.addAttribute("initialPageUrl", request.getRequestURI());
        model.addAttribute("initialPageKey", pageKey);
        return "layout";
    }
}
