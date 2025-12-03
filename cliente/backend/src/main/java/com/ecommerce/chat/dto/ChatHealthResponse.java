package com.ecommerce.chat.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatHealthResponse {
    private boolean ok;
    private String provider;
    private String model;
    private String message;
    private String error;
}
