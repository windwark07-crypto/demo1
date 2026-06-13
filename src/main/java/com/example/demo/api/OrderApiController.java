package com.example.demo.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
public class OrderApiController {

    @GetMapping("/api/orders")
    public List<OrderResponse> orders() {
        return List.of(
                new OrderResponse("O-20260613-001", "홍길동", LocalDate.of(2026, 6, 13), "접수"),
                new OrderResponse("O-20260613-002", "김영희", LocalDate.of(2026, 6, 13), "처리중"),
                new OrderResponse("O-20260612-009", "이철수", LocalDate.of(2026, 6, 12), "완료")
        );
    }

    public record OrderResponse(String orderId, String customerName, LocalDate orderDate, String status) {
    }
}
