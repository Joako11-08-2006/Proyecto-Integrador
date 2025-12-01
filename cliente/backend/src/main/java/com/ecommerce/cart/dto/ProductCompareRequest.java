package com.ecommerce.cart.dto;

import java.util.List;
import lombok.Data;

@Data
public class ProductCompareRequest {
    private List<Long> ids;
}
