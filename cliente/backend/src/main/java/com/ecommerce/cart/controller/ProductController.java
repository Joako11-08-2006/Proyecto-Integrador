package com.ecommerce.cart.controller;

import com.ecommerce.cart.dto.ProductCompareRequest;
import com.ecommerce.cart.dto.ProductResponse;
import com.ecommerce.cart.service.ProductService;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public List<ProductResponse> list(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(value = "sort", required = false) String sort
    ) {
        return productService.findAll(search, brand, minPrice, maxPrice, sort);
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable Long id) {
        return productService.findById(id);
    }

    @GetMapping("/featured")
    public List<ProductResponse> featured() {
        return productService.featured();
    }

    @PostMapping("/compare")
    public List<ProductResponse> compare(@RequestBody ProductCompareRequest request) {
        return productService.compare(request);
    }
}
