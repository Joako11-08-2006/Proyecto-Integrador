package com.ecommerce.cart.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductStat {
    private String productName;
    private int quantity;
    private BigDecimal total;

    public ProductStat merge(ProductStat other) {
        return new ProductStat(
                productName != null ? productName : other.productName,
                quantity + other.quantity,
                total.add(other.total)
        );
    }
}
