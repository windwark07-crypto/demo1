package com.example.demo.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class UserApiController {

    @GetMapping("/api/users")
    public List<UserResponse> users() {
        return List.of(
                new UserResponse("user01", "홍길동", "관리자", "사용"),
                new UserResponse("user02", "김영희", "업무담당자", "사용"),
                new UserResponse("user03", "이철수", "조회사용자", "중지")
        );
    }

    public record UserResponse(String userId, String userName, String roleName, String status) {
    }
}
