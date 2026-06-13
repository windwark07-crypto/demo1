package com.example.demo.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ProductApiController {

    @GetMapping("/api/products")
    public List<ProductResponse> products() {
        return List.of(
                new ProductResponse("P-1001", "업무용 노트북", "전자기기", 1450000),
                new ProductResponse("P-1002", "모니터 27형", "전자기기", 320000),
                new ProductResponse("P-1003", "보안 토큰", "소모품", 45000)
        );
    }

    public record ProductResponse(String productId, String productName, String category, int price) {
    }
}
