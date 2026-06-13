package com.example.demo.menu;

public record MenuItem(
        String id,
        String name,
        String fragmentUrl,
        String pageKey,
        String groupName
) {
}
