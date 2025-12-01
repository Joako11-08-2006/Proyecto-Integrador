package com.ecommerce.cart.controller;

import lombok.Data;

@Data
public class OrderStatusRequest {
    private String status;
    private String paymentStatus;
    private String shippingStatus;
}
