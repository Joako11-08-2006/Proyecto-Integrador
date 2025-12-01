package com.ecommerce.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VoucherUploadResponse {
    private String message;
    private String voucherUrl;
    private String operationCode;
}
