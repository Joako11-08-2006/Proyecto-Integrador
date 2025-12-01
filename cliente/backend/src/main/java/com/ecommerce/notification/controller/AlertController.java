package com.ecommerce.notification.controller;

import com.ecommerce.cart.entity.Product;
import com.ecommerce.cart.repository.ProductRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
public class AlertController {

    private static final int STOCK_MIN = 5;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/low-stock")
    public List<LowStockDto> lowStock() {
        return productRepository.findAll().stream()
                .filter(p -> p.getStock() != null && p.getStock() <= STOCK_MIN)
                .map(p -> new LowStockDto(p.getId(), p.getNombre(), p.getStock()))
                .collect(Collectors.toList());
    }

    public record LowStockDto(Long id, String nombre, Integer stock) {}
}
