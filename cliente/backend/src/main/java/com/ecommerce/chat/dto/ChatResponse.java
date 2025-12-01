package com.ecommerce.chat.dto;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatResponse {
    private String text;
    private List<String> suggestions;
}
