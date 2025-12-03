package com.ecommerce.chat.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatStatusResponse {
    private boolean enabled;
    private String model;
}
