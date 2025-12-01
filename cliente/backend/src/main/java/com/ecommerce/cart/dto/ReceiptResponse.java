package com.ecommerce.cart.dto;

import com.ecommerce.cart.entity.Order;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReceiptResponse {
    private Long orderId;
    private String customerName;
    private String customerEmail;
    private String paymentMethod;
    private String paymentStatus;
    private String operationCode;
    private String voucherUrl;
    private String shippingAddress;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private BigDecimal total;
    private Order.Status status;
    private List<OrderItemResponse> items;
}
