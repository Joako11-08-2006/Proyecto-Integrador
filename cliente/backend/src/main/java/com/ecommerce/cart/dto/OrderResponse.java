package com.ecommerce.cart.dto;

import com.ecommerce.cart.entity.Order;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private Long userId;
    private BigDecimal total;
    private Order.Status status;
    private String paymentMethod;
    private String paymentStatus;
    private String voucherUrl;
    private String operationCode;
    private LocalDateTime paymentVerifiedAt;
    private String shippingAddress;
    private String shippingStatus;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
}
